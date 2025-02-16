import { ZodPipe } from './zod.pipe';
import { BadRequestException } from '@nestjs/common';
import { ZodSchema, z } from 'zod';

type Detail = {
  code: string;
  message: string;
  path: string;
};

describe('ZodPipe', () => {
  let pipe: ZodPipe;

  const schema: ZodSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
  });

  beforeEach(() => {
    pipe = new ZodPipe(schema);
  });

  it('should not throw an error for valid input', () => {
    const validData = {
      firstName: 'John',
      lastName: 'test',
    };

    expect(() => pipe.transform(validData)).not.toThrow();
  });

  it('should throw a BadRequestException for missing data', () => {
    expect(() => pipe.transform(null)).toThrow(
      new BadRequestException('No data provided'),
    );
    expect(() => pipe.transform(undefined)).toThrow(
      new BadRequestException('No data provided'),
    );
  });

  it('should throw a BadRequestException with the correct error details for invalid input', () => {
    const invalidData = {
      firstName: 'J',
      lastName: 123,
    };

    try {
      pipe.transform(invalidData);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);

      const errorResponse = error.getResponse();

      const errorDetails = errorResponse.message;
      expect(errorDetails).toHaveLength(2);

      expect(errorDetails[0]).toMatchObject({
        path: 'firstName',
        message: 'String must contain at least 2 character(s)',
        code: 'too_small',
      });

      expect(errorDetails[1]).toMatchObject({
        path: 'lastName',
        message: 'Expected string, received number',
        code: 'invalid_type',
      });
    }
  });

  it('should throw a BadRequestException with the correct error structure for missing fields', () => {
    const invalidData = {
      firstName: 'John',
    };

    try {
      pipe.transform(invalidData);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequestException);

      const errorResponse = error.getResponse();

      const errorDetails = errorResponse.message as Detail[];
      expect(errorDetails).toHaveLength(1);

      expect(errorDetails[0]).toMatchObject({
        path: 'lastName',
        message: 'Required',
        code: 'invalid_type',
      });
    }
  });
});
