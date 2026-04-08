import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Car, CarType, Gearbox, PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import Stripe from 'stripe';
import { PrismaService } from 'src/db/prisma.service';
import {
  CreateReservationSchema,
  JwtUser,
  PaymentIntentSchema,
} from 'src/shared/types';
import { ReservationsService } from './reservations.service';
import { STRIPE_CLIENT } from './stripe.provider';
import { MS_PER_DAY } from './utils/reservation-pricing';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let stripeMock: DeepMockProxy<Stripe>;

  const userId = 'user111111111111111111111111';
  const jwtUser = {
    id: userId,
    email: 'test@example.com',
    role: 'USER',
  } as JwtUser;
  const startDate = new Date(Date.now() + 7 * MS_PER_DAY);
  const endDate = new Date(startDate.getTime() + 2 * MS_PER_DAY);

  const mockCar = {
    id: 'car111111111111111111111111',
    name: 'Test Car',
    description: 'desc',
    price: 100,
    carType: CarType.SEDAN,
    images: [],
    tankCapacity: 50,
    gearbox: Gearbox.MANUAL,
    seats: 4,
    favouritesListIds: [],
    createdAt: new Date(),
  } as Car;

  const intentPayload: PaymentIntentSchema = {
    carId: mockCar.id,
    startDate,
    endDate,
    pickupLocationId: 'loc111111111111111111111111',
    dropoffLocationId: 'loc222222222222222222222222',
  };

  const createPayload: CreateReservationSchema = {
    ...intentPayload,
    paymentIntentId: 'pi_123',
    marketingConsent: true,
    billingInfo: {
      name: 'John Doe',
      phoneNumber: '+48123456789',
      address: 'Main Street 12',
      city: 'Metropolis',
    },
  };

  const succeededIntent = {
    id: 'pi_123',
    status: 'succeeded',
    amount: 20000,
    metadata: { userId },
  } as unknown as Stripe.Response<Stripe.PaymentIntent>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    stripeMock = mockDeep<Stripe>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: STRIPE_CLIENT, useValue: stripeMock },
      ],
    }).compile();

    service = module.get(ReservationsService);

    prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    beforeEach(() => {
      prismaMock.car.findUnique.mockResolvedValue(mockCar);
      prismaMock.location.count.mockResolvedValue(2);
      prismaMock.reservation.count.mockResolvedValue(0);
      stripeMock.paymentIntents.create.mockResolvedValue({
        id: 'pi_123',
        client_secret: 'pi_123_secret',
      } as unknown as Stripe.Response<Stripe.PaymentIntent>);
    });

    it('should create an intent with the server-computed amount in cents', async () => {
      const result = await service.createPaymentIntent(jwtUser, intentPayload);

      expect(stripeMock.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 20000,
          currency: 'usd',
          receipt_email: 'test@example.com',
          metadata: expect.objectContaining({ userId, carId: mockCar.id }),
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          clientSecret: 'pi_123_secret',
          paymentIntentId: 'pi_123',
          days: 2,
          subtotal: 200,
          discountPercent: 0,
          totalPrice: 200,
        }),
      );
    });

    it('should apply an active promo code to the amount', async () => {
      prismaMock.promoCode.findUnique.mockResolvedValue({
        id: 'promo1',
        code: 'SUMMER10',
        discountPercent: 10,
        active: true,
        createdAt: new Date(),
      });

      const result = await service.createPaymentIntent(jwtUser, {
        ...intentPayload,
        promoCode: 'SUMMER10',
      });

      expect(stripeMock.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 18000 }),
      );
      expect(result.totalPrice).toBe(180);
    });

    it('should throw NotFoundException when car does not exist', async () => {
      prismaMock.car.findUnique.mockResolvedValue(null);

      await expect(
        service.createPaymentIntent(jwtUser, intentPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when a location is missing', async () => {
      prismaMock.location.count.mockResolvedValue(1);

      await expect(
        service.createPaymentIntent(jwtUser, intentPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when dates overlap a reservation', async () => {
      prismaMock.reservation.count.mockResolvedValue(1);

      await expect(
        service.createPaymentIntent(jwtUser, intentPayload),
      ).rejects.toThrow(ConflictException);
      expect(stripeMock.paymentIntents.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for an invalid promo code', async () => {
      prismaMock.promoCode.findUnique.mockResolvedValue(null);

      await expect(
        service.createPaymentIntent(jwtUser, {
          ...intentPayload,
          promoCode: 'NOPE',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    beforeEach(() => {
      prismaMock.reservation.findUnique.mockResolvedValue(null);
      prismaMock.car.findUnique.mockResolvedValue(mockCar);
      prismaMock.reservation.count.mockResolvedValue(0);
      stripeMock.paymentIntents.retrieve.mockResolvedValue(succeededIntent);
    });

    it('should create a confirmed reservation after verifying the payment', async () => {
      const created = { id: 'res1' };
      prismaMock.reservation.create.mockResolvedValue(created as never);

      const result = await service.create(userId, createPayload);

      expect(result).toEqual(created);
      expect(prismaMock.reservation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'CONFIRMED',
            totalPrice: 200,
            paymentIntentId: 'pi_123',
            billingInfo: createPayload.billingInfo,
            userId,
          }),
        }),
      );
    });

    it('should throw ConflictException when the payment was already used', async () => {
      prismaMock.reservation.findUnique.mockResolvedValue({
        id: 'res1',
      } as never);

      await expect(service.create(userId, createPayload)).rejects.toThrow(
        ConflictException,
      );
      expect(stripeMock.paymentIntents.retrieve).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when the payment did not succeed', async () => {
      stripeMock.paymentIntents.retrieve.mockResolvedValue({
        ...succeededIntent,
        status: 'requires_payment_method',
      } as unknown as Stripe.Response<Stripe.PaymentIntent>);

      await expect(service.create(userId, createPayload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException when the payment belongs to another user', async () => {
      stripeMock.paymentIntents.retrieve.mockResolvedValue({
        ...succeededIntent,
        metadata: { userId: 'someone-else' },
      } as unknown as Stripe.Response<Stripe.PaymentIntent>);

      await expect(service.create(userId, createPayload)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException when the paid amount does not match', async () => {
      stripeMock.paymentIntents.retrieve.mockResolvedValue({
        ...succeededIntent,
        amount: 12345,
      } as unknown as Stripe.Response<Stripe.PaymentIntent>);

      await expect(service.create(userId, createPayload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should refund and throw ConflictException when availability was lost', async () => {
      prismaMock.reservation.count.mockResolvedValue(1);

      await expect(service.create(userId, createPayload)).rejects.toThrow(
        ConflictException,
      );
      expect(stripeMock.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
      });
      expect(prismaMock.reservation.create).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    const reservation = {
      id: 'res1',
      userId,
      status: 'CONFIRMED',
      startDate: new Date(Date.now() + 7 * MS_PER_DAY),
      paymentIntentId: 'pi_123',
    };

    it('should refund the payment and mark the reservation cancelled', async () => {
      prismaMock.reservation.findUnique.mockResolvedValue(reservation as never);
      prismaMock.reservation.update.mockResolvedValue({
        ...reservation,
        status: 'CANCELLED',
      } as never);

      const result = await service.cancel(userId, 'res1');

      expect(stripeMock.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
      });
      expect(prismaMock.reservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'res1' },
          data: { status: 'CANCELLED' },
        }),
      );
      expect(result).toEqual(expect.objectContaining({ status: 'CANCELLED' }));
    });

    it('should throw NotFoundException for a missing reservation', async () => {
      prismaMock.reservation.findUnique.mockResolvedValue(null);

      await expect(service.cancel(userId, 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException for another user's reservation", async () => {
      prismaMock.reservation.findUnique.mockResolvedValue({
        ...reservation,
        userId: 'someone-else',
      } as never);

      await expect(service.cancel(userId, 'res1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(stripeMock.refunds.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when already cancelled', async () => {
      prismaMock.reservation.findUnique.mockResolvedValue({
        ...reservation,
        status: 'CANCELLED',
      } as never);

      await expect(service.cancel(userId, 'res1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should refuse cancellation less than 72 hours before pick-up', async () => {
      prismaMock.reservation.findUnique.mockResolvedValue({
        ...reservation,
        startDate: new Date(Date.now() + 2 * MS_PER_DAY),
      } as never);

      await expect(service.cancel(userId, 'res1')).rejects.toThrow(
        BadRequestException,
      );
      expect(stripeMock.refunds.create).not.toHaveBeenCalled();
    });
  });

  describe('getBookedRanges', () => {
    it('should return future non-cancelled ranges', async () => {
      const ranges = [{ startDate, endDate }];
      prismaMock.reservation.findMany.mockResolvedValue(ranges as never);

      const result = await service.getBookedRanges(mockCar.id);

      expect(result).toEqual(ranges);
      expect(prismaMock.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            carId: mockCar.id,
            status: { not: 'CANCELLED' },
          }),
          select: { startDate: true, endDate: true },
        }),
      );
    });
  });
});
