import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';
import { UsersService } from 'src/users/users.service';
import { BilingService } from './biling.service';
import { BilingSchema, UpdateBilingSchema } from 'src/shared/types';

describe('BilingService', () => {
  let service: BilingService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let usersServiceMock: jest.Mocked<UsersService>;

  const userId = 'user123';
  const adminUser = { id: 'admin123', role: 'ADMIN' } as any;
  const regularUser = { id: userId, role: 'USER' } as any;
  const strangerUser = { id: 'otherUser', role: 'USER' } as any;

  const bilingInfo = {
    id: 'biling123',
    userId,
    phoneNumber: '+48123456789',
    address: '123 Main St',
    city: 'Metropolis',
    postalCode: '12-345',
    user: regularUser,
    createdAt: new Date(),
  };

  const bilingPayload: BilingSchema = {
    phoneNumber: '+48123456789',
    address: '123 Main St',
    city: 'Metropolis',
    postalCode: '12-345',
  };

  const updatePayload: UpdateBilingSchema = {
    address: 'Updated Street',
  };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    usersServiceMock = {
      findOneById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BilingService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compile();

    service = module.get(BilingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addBilingInfo', () => {
    it('should create biling info when none exists', async () => {
      usersServiceMock.findOneById.mockResolvedValue(regularUser);
      prismaMock.bilingInfo.count.mockResolvedValue(0);
      prismaMock.bilingInfo.create.mockResolvedValue(bilingInfo);

      const result = await service.addBilingInfo(userId, bilingPayload);

      expect(result).toEqual(bilingInfo);
      expect(prismaMock.bilingInfo.create).toHaveBeenCalledWith({
        data: { ...bilingPayload, user: { connect: { id: userId } } },
        omit: { userId: true },
      });
    });

    it('should throw ConflictException if biling info already exists', async () => {
      usersServiceMock.findOneById.mockResolvedValue(regularUser);
      prismaMock.bilingInfo.count.mockResolvedValue(1);

      await expect(
        service.addBilingInfo(userId, bilingPayload),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all biling info', async () => {
      prismaMock.bilingInfo.findMany.mockResolvedValue([bilingInfo]);

      const result = await service.findAll();

      expect(result).toEqual([bilingInfo]);
    });
  });

  describe('findOne', () => {
    it('should return biling info if owner', async () => {
      prismaMock.bilingInfo.findUnique.mockResolvedValue({
        ...bilingInfo,
      });

      const result = await service.findOne(regularUser, bilingInfo.id);

      expect(result).toEqual({ ...bilingInfo, user: regularUser });
    });

    it("should allow ADMIN to view another user's biling info", async () => {
      prismaMock.bilingInfo.findUnique.mockResolvedValue({
        ...bilingInfo,
      });

      const result = await service.findOne(adminUser, bilingInfo.id);

      expect(result).toEqual({ ...bilingInfo, user: regularUser });
    });

    it('should throw NotFoundException if not found', async () => {
      prismaMock.bilingInfo.findUnique.mockResolvedValue(null);

      await expect(service.findOne(regularUser, bilingInfo.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if not owner or admin', async () => {
      prismaMock.bilingInfo.findUnique.mockResolvedValue({
        ...bilingInfo,
      });

      await expect(
        service.findOne(strangerUser, bilingInfo.id),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update biling info successfully if owner', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) =>
        cb({
          bilingInfo: {
            findUnique: jest.fn().mockResolvedValue(bilingInfo),
            update: prismaMock.bilingInfo.update,
          },
        } as any),
      );
      prismaMock.bilingInfo.update.mockResolvedValue({
        ...bilingInfo,
        ...updatePayload,
      });

      const result = await service.update(
        regularUser,
        bilingInfo.id,
        updatePayload,
      );

      expect(result).toEqual({ ...bilingInfo, ...updatePayload });
      expect(prismaMock.bilingInfo.update).toHaveBeenCalledWith({
        where: { id: bilingInfo.id },
        data: updatePayload,
        omit: { userId: true },
      });
    });

    it("should allow ADMIN to update another user's biling info", async () => {
      prismaMock.$transaction.mockImplementation(async (cb) =>
        cb({
          bilingInfo: {
            findUnique: jest.fn().mockResolvedValue(bilingInfo),
            update: prismaMock.bilingInfo.update,
          },
        } as any),
      );
      prismaMock.bilingInfo.update.mockResolvedValue({
        ...bilingInfo,
        ...updatePayload,
      });

      const result = await service.update(
        adminUser,
        bilingInfo.id,
        updatePayload,
      );

      expect(result).toEqual({ ...bilingInfo, ...updatePayload });
    });

    it('should throw NotFoundException if biling info not found', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) =>
        cb({
          bilingInfo: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        } as any),
      );

      await expect(
        service.update(regularUser, bilingInfo.id, updatePayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user not owner nor admin', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) =>
        cb({
          bilingInfo: {
            findUnique: jest.fn().mockResolvedValue(bilingInfo),
          },
        } as any),
      );

      await expect(
        service.update(strangerUser, bilingInfo.id, updatePayload),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove biling info successfully if owner', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) =>
        cb({
          bilingInfo: {
            findUnique: jest.fn().mockResolvedValue(bilingInfo),
            delete: prismaMock.bilingInfo.delete,
          },
        } as any),
      );
      prismaMock.bilingInfo.delete.mockResolvedValue(bilingInfo);

      const result = await service.remove(regularUser, bilingInfo.id);

      expect(result).toEqual({ message: 'Biling info removed' });
      expect(prismaMock.bilingInfo.delete).toHaveBeenCalledWith({
        where: { id: bilingInfo.id },
      });
    });

    it('should throw NotFoundException if biling info not found', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) =>
        cb({
          bilingInfo: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        } as any),
      );

      await expect(service.remove(regularUser, bilingInfo.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user not owner nor admin', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) =>
        cb({
          bilingInfo: {
            findUnique: jest.fn().mockResolvedValue(bilingInfo),
          },
        } as any),
      );

      await expect(service.remove(strangerUser, bilingInfo.id)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
