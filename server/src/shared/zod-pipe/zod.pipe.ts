import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

type Detail = {
  code: string;
  message: string;
  path: string;
};

@Injectable()
export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: any) {
    if (!value) throw new BadRequestException('No data provided');

    const output = this.schema.safeParse(value);
    if (!output.success) {
      const details = output.error.issues.reduce<Detail[]>((acc, issue) => {
        const { message, code } = issue;
        const path = issue.path.join(', ');

        if (path === '') {
          return acc;
        }

        return [...acc, { path, message, code }];
      }, []);

      throw new BadRequestException(details);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return output.data;
  }
}
