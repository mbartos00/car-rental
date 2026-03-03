import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
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
        data: {
          ...mockUser,
          favouritesList: {
            create: {},
          },
        },
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

    it('should return null when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await usersService.findOneByEmail(
        'nonexistent@example.com',
      );

      expect(result).toBeNull();
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
    it('should update user fields without touching password', async () => {
      const payload = { firstName: 'Updated' };
      prismaMock.user.update.mockResolvedValue(mockUser);

      const result = await usersService.update('1', payload);

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: payload,
        omit: { password: true },
      });
    });

    it('should verify old password and store a hash when updating password', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.update.mockResolvedValue(mockUser);
      const compareSpy = jest
        .spyOn(bcrypt, 'compareSync')
        .mockReturnValue(true);
      const hashSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('newHashedPassword' as never);

      await usersService.update('1', { password: 'NewPass1!' }, 'OldPass1!');

      expect(compareSpy).toHaveBeenCalledWith('OldPass1!', mockUser.password);
      expect(hashSpy).toHaveBeenCalledWith('NewPass1!', 10);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: 'newHashedPassword' },
        omit: { password: true },
      });
    });

    it('should throw BadRequestException when old password is wrong', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      await expect(
        usersService.update('1', { password: 'NewPass1!' }, 'WrongOld1!'),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when old password is missing', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        usersService.update('1', { password: 'NewPass1!' }),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        usersService.update('1', { password: 'NewPass1!' }, 'OldPass1!'),
      ).rejects.toThrow(NotFoundException);
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
