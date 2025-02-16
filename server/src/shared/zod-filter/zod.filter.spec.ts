import { ZodFilter } from './zod.filter';
import { ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { ZodError, ZodIssue } from 'zod';

describe('ZodFilter', () => {
  it('should be defined', () => {
    expect(new ZodFilter()).toBeDefined();
  });
});
describe('ZodFilter', () => {
  let zodFilter: ZodFilter<ZodError>;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: Response;

  beforeEach(() => {
    zodFilter = new ZodFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue(mockResponse),
    } as any;
  });

  it('should be defined', () => {
    expect(zodFilter).toBeDefined();
  });

  it('should handle ZodError and return 400 status with error details', () => {
    const zodError = new ZodError([
      {
        path: ['field'],
        message: 'Invalid field',
        code: 'invalid_type',
      } as ZodIssue,
    ]);

    zodFilter.catch(zodError, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      errors: zodError.errors,
      message: zodError.message,
      statusCode: 400,
    });
  });
});
