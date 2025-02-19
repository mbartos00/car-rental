import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
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
    it('should create a new user with avatar', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test User',
        lastName: 'Test',
        password: 'hashedPassword',
        repeatPassword: 'hashedPassword',
        role: Role.USER,
      };

      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await usersService.create(mockUser, 'avatar.jpg');

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          ...mockUser,
          avatar: `${process.env.DOMAIN}/avatar.jpg`,
        },
        omit: { password: true },
      });
    });

    it('should create a new user without avatar', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test User',
        lastName: 'Test',
        password: 'hashedPassword',
        repeatPassword: 'hashedPassword',
        role: Role.USER,
      };

      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await usersService.create(mockUser, undefined);

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: mockUser,
        omit: { password: true },
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return array of users without passwords', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test User',
          lastName: 'Test',
          password: 'hashedPassword',
          repeatPassword: 'hashedPassword',
          role: Role.USER,
        },
        {
          id: '2',
          email: 'test2@example.com',
          firstName: 'Test User',
          lastName: 'Test',
          password: 'hashedPassword',
          repeatPassword: 'hashedPassword',
          role: Role.USER,
        },
      ];

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
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test User',
        lastName: 'Test',
        password: 'hashedPassword',
        repeatPassword: 'hashedPassword',
        role: Role.USER,
      };

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
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test User',
        lastName: 'Test',
        password: 'hashedPassword',
        repeatPassword: 'hashedPassword',
        role: Role.USER,
      };

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
    it('should update user with avatar', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test User',
        lastName: 'Test',
        password: 'hashedPassword',
        repeatPassword: 'hashedPassword',
        role: Role.USER,
      };

      prismaMock.user.update.mockResolvedValue(mockUser);

      const result = await usersService.update('1', mockUser, 'new-avatar.jpg');

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          ...mockUser,
          avatar: `${process.env.DOMAIN}/new-avatar.jpg`,
        },
        omit: { password: true },
      });
    });

    it('should update user without avatar', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test User',
        lastName: 'Test',
        password: 'hashedPassword',
        repeatPassword: 'hashedPassword',
        role: Role.USER,
      };

      prismaMock.user.update.mockResolvedValue(mockUser);

      const result = await usersService.update('1', mockUser, undefined);

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
      const mockDeletedUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test User',
        lastName: 'Test',
        password: 'hashedPassword',
        repeatPassword: 'hashedPassword',
        role: Role.USER,
      };

      prismaMock.user.delete.mockResolvedValue(mockDeletedUser);

      const result = await usersService.remove('1');
      expect(result).toEqual(mockDeletedUser);
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
