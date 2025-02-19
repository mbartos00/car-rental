import { FileInterceptor } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { ValidUpdatedUser, ValidUser } from 'src/shared/types';
import { ZodPipe } from 'src/shared/zod-pipe/zod.pipe';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BadRequestException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            getAllUsers: jest.fn(),
            findOneByEmail: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: ZodPipe,
          useValue: {
            transform: jest.fn((value) => value),
          },
        },
        {
          provide: FileInterceptor,
          useValue: {
            intercept: jest.fn().mockReturnValue({
              file: jest.fn().mockReturnValue(null),
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<jest.Mocked<UsersService>>(UsersService);
  });

  describe('create', () => {
    const mockUser: ValidUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'password123',
      repeatPassword: 'password123',
      role: Role.USER,
    };

    it('should create a new user with avatar', async () => {
      const mockFile = {
        filename: 'test-avatar.jpg',
      } as Express.Multer.File;

      usersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(mockUser, mockFile);

      expect(result).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith(
        {
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
          password: mockUser.password,
          role: mockUser.role,
        },
        mockFile.filename,
      );
    });

    it('should create a new user without avatar', async () => {
      usersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(mockUser, undefined);

      expect(result).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith(
        {
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
          password: mockUser.password,
          role: mockUser.role,
        },
        undefined,
      );
    });

    it('should throw a BadRequestException when user exists', async () => {
      usersService.findOneByEmail = jest.fn().mockResolvedValue(mockUser);

      await expect(controller.create(mockUser, undefined)).rejects.toThrow(
        BadRequestException,
      );

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'test1@example.com',
          role: Role.USER,
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'test2@example.com',
          role: Role.ADMIN,
        },
      ];

      usersService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(usersService.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find user by email', async () => {
      const mockUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        role: Role.USER,
      };

      usersService.findOneByEmail.mockResolvedValue(mockUser);

      const result = await controller.findOne('test@example.com');

      expect(result).toEqual(mockUser);
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });
  });

  describe('update', () => {
    const mockId = '1';
    const mockUser: ValidUpdatedUser = {
      firstName: 'Updated',
      lastName: 'Name',
      email: 'updated@example.com',
      repeatPassword: 'new-password',
      oldPassword: 'old-password',
    };

    it('should update user with avatar', async () => {
      const mockFile = {
        filename: 'updated-avatar.jpg',
      } as Express.Multer.File;

      usersService.update.mockResolvedValue(mockUser);

      const result = await controller.update(mockId, mockUser, mockFile);

      expect(result).toEqual({ message: 'User updated' });
      expect(usersService.update).toHaveBeenCalledWith(
        mockId,
        {
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
        },
        mockFile.filename,
      );
    });

    it('should update user without avatar', async () => {
      usersService.update.mockResolvedValue(mockUser);

      const result = await controller.update(mockId, mockUser, undefined);

      expect(result).toEqual({ message: 'User updated' });
      expect(usersService.update).toHaveBeenCalledWith(
        mockId,
        {
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
        },
        undefined,
      );
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      const mockId = '1';
      const mockUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        role: Role.USER,
      };

      usersService.remove.mockResolvedValue(mockUser);

      const result = await controller.remove(mockId);

      expect(result).toEqual({ message: `User ${mockUser.email} removed` });
      expect(usersService.remove).toHaveBeenCalledWith(mockId);
    });
  });
});
