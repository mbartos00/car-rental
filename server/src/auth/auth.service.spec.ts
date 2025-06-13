import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/db/prisma.service';
import { UserWithoutPassword } from 'src/shared/types';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: DeepMockProxy<UsersService>;
  let prisma: DeepMockProxy<PrismaClient>;
  let jwtService: DeepMockProxy<JwtService>;

  const mockUser: User = {
    id: '1',
    firstName: 'test',
    lastName: 'test',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: Role.USER,
    createdAt: new Date(),
  };

  let hashSpy: jest.SpyInstance;

  beforeEach(async () => {
    usersService = mockDeep<UsersService>();
    prisma = mockDeep<PrismaClient>();
    jwtService = mockDeep<JwtService>();

    hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: PrismaService, useValue: { user: prisma.user } },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should throw ConflictException if user exists', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(mockUser);

      await expect(
        authService.register({
          email: mockUser.email,
          password: 'plain',
        } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password and create user', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);
      usersService.create.mockResolvedValueOnce({ ...mockUser });

      const result = await authService.register({
        email: mockUser.email,
        password: 'plain',
        firstName: 'test',
        lastName: 'test',
        role: Role.USER,
      });

      expect(hashSpy).toHaveBeenCalledWith('plain', 10);
      expect(usersService.create).toHaveBeenCalledWith({
        email: mockUser.email,
        password: 'hashed',
        firstName: 'test',
        lastName: 'test',
        role: Role.USER,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('validateUser', () => {
    it('should throw if user not found', async () => {
      usersService.findOneByEmail.mockResolvedValueOnce(null);

      await expect(
        authService.validateUser('test@example.com', 'plain'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if password does not match', async () => {
      usersService.findOneByEmail.mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      await expect(
        authService.validateUser('test@example.com', 'wrong'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return user without password on success', async () => {
      usersService.findOneByEmail.mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      const result = await authService.validateUser(
        'test@example.com',
        'plain',
      );

      const { password: _, ...restOfUser } = mockUser;

      expect(result).toEqual(restOfUser);
    });
  });

  describe('login', () => {
    it('should return tokens and user', async () => {
      const validatedUser: UserWithoutPassword = {
        id: mockUser.id,
        firstName: 'test',
        lastName: 'test',
        email: mockUser.email,
        role: mockUser.role,
        createdAt: new Date(),
      };

      jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValueOnce(validatedUser);

      jwtService.signAsync
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');

      const result = await authService.login({
        email: mockUser.email,
        password: 'plain',
      });

      expect(result).toEqual({
        user: validatedUser,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      expect(authService.validateUser).toHaveBeenCalledWith(
        mockUser.email,
        'plain',
      );
    });
  });

  describe('refreshToken', () => {
    it('should throw UnauthorizedException if no token', async () => {
      await expect(authService.refreshToken(undefined as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('bad token');
      });

      await expect(authService.refreshToken('badToken')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return new access token on valid refresh token', async () => {
      jwtService.verify.mockReturnValueOnce({
        sub: '1',
        email: mockUser.email,
        role: mockUser.role,
      });

      jwtService.signAsync.mockResolvedValueOnce('newAccessToken');

      const result = await authService.refreshToken('goodToken');

      expect(result).toBe('newAccessToken');
      expect(jwtService.verify).toHaveBeenCalledWith('goodToken', {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: '1', email: mockUser.email, role: mockUser.role },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN,
        },
      );
    });
  });
});
