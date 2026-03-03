import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  bilingSchema,
  updateBilingSchema,
} from 'src/shared/schemas/biling.schema';
import { BilingSchema, JwtUser, UpdateBilingSchema } from 'src/shared/types';
import { ZodPipe } from 'src/shared/zod-pipe/zod.pipe';
import { BilingController } from './biling.controller';
import { BilingService } from './biling.service';

describe('BilingController', () => {
  let controller: BilingController;
  let bilingService: jest.Mocked<BilingService>;

  const mockUser: JwtUser = {
    id: 'user123',
    email: 'test@example.com',
    role: 'USER',
  };

  const mockBiling: any = {
    id: 'biling123',
    phoneNumber: '+48123456789',
    address: '123 Main St',
    city: 'Metropolis',
    postalCode: '12-345',
  };

  const mockBilingInput: BilingSchema = {
    phoneNumber: '+48123456789',
    address: '123 Main St',
    city: 'Metropolis',
    postalCode: '12-345',
  };

  const mockUpdateBiling: UpdateBilingSchema = {
    address: '456 Updated Ave',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BilingController],
      providers: [
        {
          provide: BilingService,
          useValue: {
            addBilingInfo: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: ZodPipe,
          useValue: { transform: jest.fn((value) => value) },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<BilingController>(BilingController);
    bilingService = module.get(BilingService) as jest.Mocked<BilingService>;
  });

  describe('create', () => {
    it('should create a new biling record successfully', async () => {
      bilingService.addBilingInfo.mockResolvedValue(mockBiling);

      const result = await controller.create(mockUser, mockBilingInput);

      expect(result).toEqual(mockBiling);
      expect(bilingService.addBilingInfo).toHaveBeenCalledWith(
        mockUser.id,
        mockBilingInput,
      );
    });

    it('should reject invalid phone number', () => {
      const invalidPayload = { ...mockBilingInput, phoneNumber: '123' };
      expect(() => bilingSchema.parse(invalidPayload)).toThrow();
    });

    it('should reject invalid postal code', () => {
      const invalidPayload = { ...mockBilingInput, postalCode: '12345' };
      expect(() => bilingSchema.parse(invalidPayload)).toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all biling records for user', async () => {
      const bilingList = [mockBiling];
      bilingService.findAll.mockResolvedValue(bilingList);

      const result = await controller.findAll();

      expect(result).toEqual(bilingList);
      expect(bilingService.findAll).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return a specific biling record', async () => {
      bilingService.findOne.mockResolvedValue(mockBiling);

      const result = await controller.findOne(mockUser, 'biling123');

      expect(result).toEqual(mockBiling);
      expect(bilingService.findOne).toHaveBeenCalledWith(mockUser, 'biling123');
    });
  });

  describe('update', () => {
    it('should update biling record successfully', async () => {
      const updatedBiling = { ...mockBiling, ...mockUpdateBiling };
      bilingService.update.mockResolvedValue(updatedBiling);

      const result = await controller.update(
        mockUser,
        'biling123',
        mockUpdateBiling,
      );

      expect(result).toEqual(updatedBiling);
      expect(bilingService.update).toHaveBeenCalledWith(
        mockUser,
        'biling123',
        mockUpdateBiling,
      );
    });

    it('should reject invalid postal code in update', () => {
      const invalidPayload = { postalCode: '99999' };
      expect(() => updateBilingSchema.parse(invalidPayload)).toThrow();
    });
  });

  describe('remove', () => {
    it('should remove biling record successfully', async () => {
      bilingService.remove.mockResolvedValue(mockBiling);

      const result = await controller.remove(mockUser, 'biling123');

      expect(result).toEqual(mockBiling);
      expect(bilingService.remove).toHaveBeenCalledWith(mockUser, 'biling123');
    });
  });
});
