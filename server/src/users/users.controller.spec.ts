import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { ValidUpdatedUser, ValidUser } from 'src/shared/types';
import { ZodPipe } from 'src/shared/zod-pipe/zod.pipe';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: any;
  let mockUser: ValidUser;
  let mockUpdateUser: ValidUpdatedUser;

  beforeEach(async () => {
    mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'password123',
      repeatPassword: 'password123',
      role: Role.USER,
    };

    mockUpdateUser = {
      firstName: 'John',
      lastName: 'asd',
      email: 'update@example.com',
    };

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
    it('should create a new user', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(mockUser);

      expect(result).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith({
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        password: mockUser.password,
        role: mockUser.role,
      });
    });

    it('should throw a BadRequestException when user exists', async () => {
      usersService.findOneByEmail = jest.fn().mockResolvedValue(mockUser);

      await expect(controller.create(mockUser)).rejects.toThrow(
        BadRequestException,
      );

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [mockUser, mockUser];

      usersService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(usersService.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find user by email and strip the password', async () => {
      usersService.findOneByEmail.mockResolvedValue(mockUser);

      const result = await controller.findOne('test@example.com');

      const { password: _, ...userWithoutPassword } = mockUser;
      expect(result).toEqual(userWithoutPassword);
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);

      await expect(controller.findOne('missing@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const mockId = '1';
      usersService.update.mockResolvedValue(mockUpdateUser);

      const result = await controller.update(mockId, mockUpdateUser);

      expect(result).toEqual({ message: 'User updated' });
      expect(usersService.update).toHaveBeenCalledWith(
        mockId,
        {
          firstName: mockUpdateUser.firstName,
          lastName: mockUpdateUser.lastName,
          email: mockUpdateUser.email,
        },
        undefined,
      );
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      const mockId = '1';

      usersService.remove.mockResolvedValue(mockUser);

      const result = await controller.remove(mockId);

      expect(result).toEqual({ message: `User ${mockUser.email} removed` });
      expect(usersService.remove).toHaveBeenCalledWith(mockId);
    });
  });
});
