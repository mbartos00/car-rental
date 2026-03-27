import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import {
  CreateReservationSchema,
  JwtUser,
  PaymentIntentSchema,
} from 'src/shared/types';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: jest.Mocked<ReservationsService>;

  const mockUser: JwtUser = {
    id: 'user1',
    email: 'test@example.com',
    role: Role.USER,
  };

  const intentPayload = {
    carId: 'car1',
    startDate: new Date(),
    endDate: new Date(),
    pickupLocationId: 'loc1',
    dropoffLocationId: 'loc2',
  } as PaymentIntentSchema;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: {
            createPaymentIntent: jest.fn(),
            create: jest.fn(),
            getBookedRanges: jest.fn(),
            findMine: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(ReservationsController);
    service = module.get(ReservationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delegate payment intent creation with the requester id', async () => {
    const response = { clientSecret: 'secret' };
    service.createPaymentIntent.mockResolvedValue(response as never);

    const result = await controller.createPaymentIntent(
      mockUser,
      intentPayload,
    );

    expect(result).toEqual(response);
    expect(service.createPaymentIntent).toHaveBeenCalledWith(
      mockUser,
      intentPayload,
    );
  });

  it('should delegate reservation creation with the requester id', async () => {
    const payload = {
      ...intentPayload,
      paymentIntentId: 'pi_123',
      marketingConsent: false,
      billingInfo: {
        name: 'John',
        phoneNumber: '+48123456789',
        address: 'Street 1',
        city: 'City',
      },
    } as CreateReservationSchema;
    service.create.mockResolvedValue({ id: 'res1' } as never);

    const result = await controller.create(mockUser, payload);

    expect(result).toEqual({ id: 'res1' });
    expect(service.create).toHaveBeenCalledWith(mockUser.id, payload);
  });

  it('should return booked ranges for a car', async () => {
    const ranges = [{ startDate: new Date(), endDate: new Date() }];
    service.getBookedRanges.mockResolvedValue(ranges as never);

    const result = await controller.getBookedRanges('car1');

    expect(result).toEqual(ranges);
    expect(service.getBookedRanges).toHaveBeenCalledWith('car1');
  });

  it("should return the requester's reservations", async () => {
    service.findMine.mockResolvedValue([] as never);

    const result = await controller.findMine(mockUser);

    expect(result).toEqual([]);
    expect(service.findMine).toHaveBeenCalledWith(mockUser.id);
  });
});
