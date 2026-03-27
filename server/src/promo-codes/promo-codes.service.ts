import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';
import { PromoCodeSchema, UpdatePromoCodeSchema } from 'src/shared/types';

@Injectable()
export class PromoCodesService {
  constructor(private readonly prismaService: PrismaService) {}

  async validate(code: string) {
    const promo = await this.prismaService.promoCode.findUnique({
      where: { code },
    });

    if (!promo || !promo.active) {
      return { valid: false as const };
    }

    return { valid: true as const, discountPercent: promo.discountPercent };
  }

  async create(payload: PromoCodeSchema) {
    try {
      return await this.prismaService.promoCode.create({ data: payload });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Promo code already exists');
      }

      throw error;
    }
  }

  async update(id: string, payload: UpdatePromoCodeSchema) {
    const promo = await this.prismaService.promoCode.findUnique({
      where: { id },
    });

    if (!promo) {
      throw new NotFoundException('Promo code not found');
    }

    return this.prismaService.promoCode.update({
      where: { id },
      data: payload,
    });
  }

  async remove(id: string) {
    const promo = await this.prismaService.promoCode.findUnique({
      where: { id },
    });

    if (!promo) {
      throw new NotFoundException('Promo code not found');
    }

    await this.prismaService.promoCode.delete({ where: { id } });

    return { message: `Promo code ${promo.code} removed` };
  }
}
