import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReservationStatus } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from 'src/db/prisma.service';
import {
  AdminReservationsQuery,
  BillingDetailsSchema,
  CreateReservationSchema,
  JwtUser,
  PaymentIntentSchema,
} from 'src/shared/types';
import {
  buildPagination,
  buildPaginatedResponse,
} from 'src/shared/utils/pagination';
import { SENSITIVE_USER_FIELDS } from 'src/users/users.service';
import { STRIPE_CLIENT } from './stripe.provider';
import { calculateReservationPrice } from './utils/reservation-pricing';

export const CANCELLATION_WINDOW_HOURS = 72;

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
  ) {}

  async createPaymentIntent(user: JwtUser, payload: PaymentIntentSchema) {
    const car = await this.prismaService.car.findUnique({
      where: { id: payload.carId },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    await this.assertLocationsExist(
      payload.pickupLocationId,
      payload.dropoffLocationId,
    );
    await this.assertAvailable(
      this.prismaService,
      payload.carId,
      payload.startDate,
      payload.endDate,
    );

    const discountPercent = await this.resolveDiscount(payload.promoCode);
    const { days, subtotal, totalPrice } = calculateReservationPrice(
      car.price,
      payload.startDate,
      payload.endDate,
      discountPercent,
    );

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: 'usd',
      payment_method_types: ['card'],
      receipt_email: user.email,
      metadata: {
        userId: user.id,
        carId: payload.carId,
        startDate: payload.startDate.toISOString(),
        endDate: payload.endDate.toISOString(),
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      days,
      subtotal,
      discountPercent,
      totalPrice,
    };
  }

  async create(userId: string, payload: CreateReservationSchema) {
    const existing = await this.prismaService.reservation.findUnique({
      where: { paymentIntentId: payload.paymentIntentId },
    });

    if (existing) {
      throw new ConflictException(
        'Reservation already exists for this payment',
      );
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      payload.paymentIntentId,
    );

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not completed');
    }

    if (paymentIntent.metadata.userId !== userId) {
      throw new ForbiddenException('Payment does not belong to user');
    }

    const car = await this.prismaService.car.findUnique({
      where: { id: payload.carId },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    const discountPercent = await this.resolveDiscount(payload.promoCode);
    const { totalPrice } = calculateReservationPrice(
      car.price,
      payload.startDate,
      payload.endDate,
      discountPercent,
    );

    if (paymentIntent.amount !== Math.round(totalPrice * 100)) {
      throw new BadRequestException('Payment amount mismatch');
    }

    return this.prismaService.$transaction(async (prisma) => {
      try {
        await this.assertAvailable(
          prisma,
          payload.carId,
          payload.startDate,
          payload.endDate,
        );
      } catch (error) {
        await this.stripe.refunds.create({
          payment_intent: payload.paymentIntentId,
        });
        throw error;
      }

      return prisma.reservation.create({
        data: {
          startDate: payload.startDate,
          endDate: payload.endDate,
          status: ReservationStatus.CONFIRMED,
          totalPrice,
          promoCode: payload.promoCode ?? null,
          discountPercent: discountPercent || null,
          paymentIntentId: payload.paymentIntentId,
          marketingConsent: payload.marketingConsent,
          billingInfo: payload.billingInfo,
          pickupLocationId: payload.pickupLocationId,
          dropoffLocationId: payload.dropoffLocationId,
          userId,
          carId: payload.carId,
        },
        omit: { userId: true },
      });
    });
  }

  async getBookedRanges(carId: string) {
    return this.prismaService.reservation.findMany({
      where: {
        carId,
        status: { not: ReservationStatus.CANCELLED },
        endDate: { gte: new Date() },
      },
      select: { startDate: true, endDate: true },
    });
  }

  async findMine(userId: string) {
    return this.prismaService.reservation.findMany({
      where: { userId },
      include: {
        car: { include: { reviews: { where: { userId } } } },
        pickupLocation: true,
        dropoffLocation: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async cancel(userId: string, id: string) {
    const reservation = await this.prismaService.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.userId !== userId) {
      throw new ForbiddenException('You cannot cancel this reservation');
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new ConflictException('Reservation is already cancelled');
    }

    if (
      reservation.startDate.getTime() - Date.now() <
      CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000
    ) {
      throw new BadRequestException(
        `Reservations can only be cancelled up to ${CANCELLATION_WINDOW_HOURS} hours before pick-up`,
      );
    }

    await this.stripe.refunds.create({
      payment_intent: reservation.paymentIntentId,
    });

    return this.prismaService.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
      omit: { userId: true },
    });
  }

  async findAll(query: AdminReservationsQuery) {
    const where = query.status ? { status: query.status } : {};
    const { skip, take } = buildPagination(query.page, query.limit);

    const [reservations, total] = await this.prismaService.$transaction([
      this.prismaService.reservation.findMany({
        where,
        include: {
          car: true,
          user: { omit: SENSITIVE_USER_FIELDS },
          pickupLocation: true,
          dropoffLocation: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prismaService.reservation.count({ where }),
    ]);

    return buildPaginatedResponse(reservations, total, query.page, query.limit);
  }

  async getStats() {
    const [revenue, totalReservations, totalCars, totalUsers, byCar, recent] =
      await Promise.all([
        this.prismaService.reservation.aggregate({
          where: { status: ReservationStatus.CONFIRMED },
          _sum: { totalPrice: true },
        }),
        this.prismaService.reservation.count(),
        this.prismaService.car.count(),
        this.prismaService.user.count(),
        this.prismaService.reservation.findMany({
          where: { status: ReservationStatus.CONFIRMED },
          select: { car: { select: { carType: true } } },
        }),
        this.prismaService.reservation.findMany({
          include: {
            car: true,
            user: { omit: SENSITIVE_USER_FIELDS },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

    const byCarType: Record<string, number> = {};
    for (const reservation of byCar) {
      byCarType[reservation.car.carType] =
        (byCarType[reservation.car.carType] ?? 0) + 1;
    }

    return {
      totalRevenue: revenue._sum.totalPrice ?? 0,
      totalReservations,
      totalCars,
      totalUsers,
      byCarType: Object.entries(byCarType).map(([carType, count]) => ({
        carType,
        count,
      })),
      recent,
    };
  }

  async updateBilling(id: string, billingInfo: BillingDetailsSchema) {
    const reservation = await this.prismaService.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return this.prismaService.reservation.update({
      where: { id },
      data: { billingInfo },
      omit: { userId: true },
    });
  }

  async adminCancel(id: string) {
    const reservation = await this.prismaService.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new ConflictException('Reservation is already cancelled');
    }

    try {
      await this.stripe.refunds.create({
        payment_intent: reservation.paymentIntentId,
      });
    } catch (error) {
      if (!(
        error instanceof Stripe.errors.StripeInvalidRequestError &&
        error.code === 'resource_missing'
      )) {
        throw error;
      }
    }

    return this.prismaService.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
      omit: { userId: true },
    });
  }

  private async resolveDiscount(promoCode?: string): Promise<number> {
    if (!promoCode) return 0;

    const promo = await this.prismaService.promoCode.findUnique({
      where: { code: promoCode },
    });

    if (!promo || !promo.active) {
      throw new BadRequestException('Invalid promo code');
    }

    return promo.discountPercent;
  }

  private async assertLocationsExist(
    pickupLocationId: string,
    dropoffLocationId: string,
  ) {
    const ids = [...new Set([pickupLocationId, dropoffLocationId])];
    const count = await this.prismaService.location.count({
      where: { id: { in: ids } },
    });

    if (count !== ids.length) {
      throw new NotFoundException('Location not found');
    }
  }

  private async assertAvailable(
    prisma: Pick<PrismaService | Prisma.TransactionClient, 'reservation'>,
    carId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const overlapping = await prisma.reservation.count({
      where: {
        carId,
        status: { not: ReservationStatus.CANCELLED },
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    });

    if (overlapping > 0) {
      throw new ConflictException('Car is already booked for these dates');
    }
  }
}
