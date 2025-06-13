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
    it('should clear the refresh_token cookie and return message', () => {
      const res = mockResponse();

      const result = controller.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(result).toEqual({ message: 'Logged out' });
    });
  });

  describe('refreshAccessToken', () => {
    it('should return a new access token', async () => {
      const req = {
        cookies: {
          refresh_token: 'refresh-token',
        },
      } as unknown as Request;

      mockAuthService.refreshToken.mockResolvedValueOnce('new-access-token');

      const result = await controller.refreshAccessToken(req);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        'refresh-token',
      );
      expect(result).toEqual({ accessToken: 'new-access-token' });
    });
  });
});
