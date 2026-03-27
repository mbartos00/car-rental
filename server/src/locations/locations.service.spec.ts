import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Location, Prisma, PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/db/prisma.service';
import { LocationsService } from './locations.service';

describe('LocationsService', () => {
  let service: LocationsService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  const mockLocation: Location = {
    id: 'loc1',
    name: 'Warsaw',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(LocationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return locations sorted by name', async () => {
    prismaMock.location.findMany.mockResolvedValue([mockLocation]);

    const result = await service.findAll();

    expect(result).toEqual([mockLocation]);
    expect(prismaMock.location.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    });
  });

  it('should create a location', async () => {
    prismaMock.location.create.mockResolvedValue(mockLocation);

    const result = await service.create({ name: 'Warsaw' });

    expect(result).toEqual(mockLocation);
  });

  it('should throw ConflictException for a duplicate name', async () => {
    prismaMock.location.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(service.create({ name: 'Warsaw' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('should throw NotFoundException when updating a missing location', async () => {
    prismaMock.location.findUnique.mockResolvedValue(null);

    await expect(service.update('missing', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should remove an unused location', async () => {
    prismaMock.location.findUnique.mockResolvedValue(mockLocation);
    prismaMock.reservation.count.mockResolvedValue(0);
    prismaMock.location.delete.mockResolvedValue(mockLocation);

    const result = await service.remove('loc1');

    expect(result).toEqual({ message: 'Location Warsaw removed' });
  });

  it('should refuse to remove a location used by reservations', async () => {
    prismaMock.location.findUnique.mockResolvedValue(mockLocation);
    prismaMock.reservation.count.mockResolvedValue(2);

    await expect(service.remove('loc1')).rejects.toThrow(ConflictException);
    expect(prismaMock.location.delete).not.toHaveBeenCalled();
  });
});
