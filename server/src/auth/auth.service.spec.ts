import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, Role, User } from '@prisma/client';
import bcrypt = require('bcrypt');
import { createHash } from 'crypto';
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
    refreshTokenHash: null,
    prevRefreshTokenHash: null,
    refreshRotatedAt: null,
  };

  const sha256 = (value: string) =>
    createHash('sha256').update(value).digest('hex');

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
    it('should throw uniform UnauthorizedException if user not found', async () => {
      usersService.findOneByEmail.mockResolvedValueOnce(null);

      await expect(
        authService.validateUser('test@example.com', 'plain'),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('should throw uniform UnauthorizedException if password does not match', async () => {
      usersService.findOneByEmail.mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      await expect(
        authService.validateUser('test@example.com', 'wrong'),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('should return user without password on success', async () => {
      usersService.findOneByEmail.mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      const result = await authService.validateUser(
        'test@example.com',
        'plain',
      );

      const {
        password: _password,
        refreshTokenHash: _hash,
        prevRefreshTokenHash: _prevHash,
        refreshRotatedAt: _rotatedAt,
        ...restOfUser
      } = mockUser;

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
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          refreshTokenHash: sha256('refreshToken'),
          prevRefreshTokenHash: null,
          refreshRotatedAt: null,
        },
      });
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

    it('should rotate tokens when presented token matches the stored hash', async () => {
      jwtService.verify.mockReturnValueOnce({
        sub: '1',
        email: mockUser.email,
        role: mockUser.role,
      });
      prisma.user.findUnique.mockResolvedValueOnce({
        ...mockUser,
        refreshTokenHash: sha256('goodToken'),
      });
      jwtService.signAsync
        .mockResolvedValueOnce('newAccessToken')
        .mockResolvedValueOnce('newRefreshToken');

      const result = await authService.refreshToken('goodToken');

      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });
      expect(jwtService.verify).toHaveBeenCalledWith('goodToken', {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          refreshTokenHash: sha256('newRefreshToken'),
          prevRefreshTokenHash: sha256('goodToken'),
          refreshRotatedAt: expect.any(Date),
        },
      });
    });

    it('should return only an access token for the previous token within the grace window', async () => {
      jwtService.verify.mockReturnValueOnce({
        sub: '1',
        email: mockUser.email,
        role: mockUser.role,
      });
      prisma.user.findUnique.mockResolvedValueOnce({
        ...mockUser,
        refreshTokenHash: sha256('currentToken'),
        prevRefreshTokenHash: sha256('previousToken'),
        refreshRotatedAt: new Date(),
      });
      jwtService.signAsync.mockResolvedValueOnce('graceAccessToken');

      const result = await authService.refreshToken('previousToken');

      expect(result).toEqual({
        accessToken: 'graceAccessToken',
        refreshToken: null,
      });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should revoke the session on token reuse outside the grace window', async () => {
      jwtService.verify.mockReturnValueOnce({
        sub: '1',
        email: mockUser.email,
        role: mockUser.role,
      });
      prisma.user.findUnique.mockResolvedValueOnce({
        ...mockUser,
        refreshTokenHash: sha256('currentToken'),
        prevRefreshTokenHash: sha256('staleToken'),
        refreshRotatedAt: new Date(Date.now() - 60_000),
      });

      await expect(authService.refreshToken('staleToken')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          refreshTokenHash: null,
          prevRefreshTokenHash: null,
          refreshRotatedAt: null,
        },
      });
    });
  });
});
