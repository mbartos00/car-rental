import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, Role, User } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/db/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let mockUser: User;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test User',
      lastName: 'Test',
      password: 'hashedPassword',
      role: Role.USER,
      createdAt: new Date(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await usersService.create(mockUser);

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: { ...mockUser },
        omit: { password: true },
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return array of users without passwords', async () => {
      const mockUsers = [mockUser, mockUser];

      prismaMock.user.findMany.mockResolvedValue(mockUsers);

      const result = await usersService.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        omit: { password: true },
      });
    });
  });

  describe('findOneByEmail', () => {
    it('should return user when found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersService.findOneByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        usersService.findOneByEmail('nonexistent@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneById', () => {
    it('should return user without password when found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersService.findOneById('1');

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        omit: { password: true },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(usersService.findOneById('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      prismaMock.user.update.mockResolvedValue(mockUser);

      const result = await usersService.update('1', mockUser);

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: mockUser,
        omit: { password: true },
      });
    });
  });

  describe('remove', () => {
    it('should delete user successfully', async () => {
      prismaMock.user.delete.mockResolvedValue(mockUser);

      const result = await usersService.remove('1');

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
