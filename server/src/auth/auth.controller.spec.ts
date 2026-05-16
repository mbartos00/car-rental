import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { type Request, type Response } from 'express';
import { Role } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
  };

  const mockJwtUser = {
    id: 'user1',
    email: 'test@example.com',
    role: Role.USER,
  };

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.cookie = jest.fn().mockReturnThis();
    res.clearCookie = jest.fn().mockReturnThis();
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn((context: ExecutionContext) => true),
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return message when user is created', async () => {
      mockAuthService.register.mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
      });

      const result = await controller.register({
        firstName: 'test',
        lastName: 'test',
        email: 'test@example.com',
        password: 'password',
        repeatPassword: 'password',
        role: Role.USER,
      });

      expect(mockAuthService.register).toHaveBeenCalledWith({
        firstName: 'test',
        lastName: 'test',
        email: 'test@example.com',
        password: 'password',
        role: Role.USER,
      });
      expect(result).toEqual({ message: 'User created' });
    });
  });

  describe('login', () => {
    it('should set cookie and return user info with message', async () => {
      const res = mockResponse();
      mockAuthService.login.mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        refreshToken: 'refresh-token',
      });

      const result = await controller.login(
        { email: 'test@example.com', password: 'password' },
        res,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }),
      );
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        message: 'Logged In',
      });
    });
  });

  describe('logout', () => {
    it('should revoke the refresh token, clear the cookie and return message', async () => {
      const res = mockResponse();

      const result = await controller.logout(mockJwtUser, res);

      expect(mockAuthService.revokeRefreshToken).toHaveBeenCalledWith('user1');
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(result).toEqual({ message: 'Logged out' });
    });
  });

  describe('refreshAccessToken', () => {
    const req = {
      cookies: {
        refresh_token: 'refresh-token',
      },
    } as unknown as Request;

    it('should set the rotated refresh cookie and return the access token', async () => {
      const res = mockResponse();
      mockAuthService.refreshToken.mockResolvedValueOnce({
        accessToken: 'new-access-token',
        refreshToken: 'rotated-refresh-token',
      });

      const result = await controller.refreshAccessToken(req, res);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        'refresh-token',
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'rotated-refresh-token',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        }),
      );
      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('should not set a cookie when no rotated token is returned', async () => {
      const res = mockResponse();
      mockAuthService.refreshToken.mockResolvedValueOnce({
        accessToken: 'new-access-token',
        refreshToken: null,
      });

      const result = await controller.refreshAccessToken(req, res);

      expect(res.cookie).not.toHaveBeenCalled();
      expect(result).toEqual({ accessToken: 'new-access-token' });
    });
  });
});
