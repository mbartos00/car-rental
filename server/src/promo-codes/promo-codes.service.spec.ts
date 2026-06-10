import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, PrismaClient, PromoCode } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/db/prisma.service';
import { PromoCodesService } from './promo-codes.service';

describe('PromoCodesService', () => {
  let service: PromoCodesService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  const mockPromo: PromoCode = {
    id: 'promo1',
    code: 'SUMMER10',
    discountPercent: 10,
    active: true,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromoCodesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(PromoCodesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all promo codes newest first', async () => {
      prismaMock.promoCode.findMany.mockResolvedValue([mockPromo]);

      const result = await service.findAll();

      expect(result).toEqual([mockPromo]);
      expect(prismaMock.promoCode.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('validate', () => {
    it('should return the discount for an active code', async () => {
      prismaMock.promoCode.findUnique.mockResolvedValue(mockPromo);

      const result = await service.validate('SUMMER10');

      expect(result).toEqual({ valid: true, discountPercent: 10 });
    });

    it('should return invalid for an unknown code', async () => {
      prismaMock.promoCode.findUnique.mockResolvedValue(null);

      const result = await service.validate('NOPE');

      expect(result).toEqual({ valid: false });
    });

    it('should return invalid for an inactive code', async () => {
      prismaMock.promoCode.findUnique.mockResolvedValue({
        ...mockPromo,
        active: false,
      });

      const result = await service.validate('SUMMER10');

      expect(result).toEqual({ valid: false });
    });
  });

  it('should create a promo code', async () => {
    prismaMock.promoCode.create.mockResolvedValue(mockPromo);

    const result = await service.create({
      code: 'SUMMER10',
      discountPercent: 10,
      active: true,
    });

    expect(result).toEqual(mockPromo);
  });

  it('should throw ConflictException for a duplicate code', async () => {
    prismaMock.promoCode.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.create({ code: 'SUMMER10', discountPercent: 10, active: true }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException when updating a missing promo', async () => {
    prismaMock.promoCode.findUnique.mockResolvedValue(null);

    await expect(service.update('missing', { active: false })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should remove a promo code', async () => {
    prismaMock.promoCode.findUnique.mockResolvedValue(mockPromo);
    prismaMock.promoCode.delete.mockResolvedValue(mockPromo);

    const result = await service.remove('promo1');

    expect(result).toEqual({ message: 'Promo code SUMMER10 removed' });
  });
});
