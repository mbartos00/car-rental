import { HttpException, HttpStatus } from '@nestjs/common';
import { type Request } from 'express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

const FILE_SIZE_LIMIT = Number(process.env.FILE_SIZE_LIMIT) || 1024 * 1024 * 2; // 2MB
const UPLOAD_DESTINATION = process.env.UPLOAD_DESTINATION || './uploads';

const multerOptions: MulterOptions = {
  limits: { fileSize: FILE_SIZE_LIMIT },

  storage: diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ) => {
      if (!existsSync(UPLOAD_DESTINATION)) {
        mkdirSync(UPLOAD_DESTINATION);
      }

      cb(null, UPLOAD_DESTINATION);
    },
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, fileName: string) => void,
    ) => {
      cb(null, generateFilename(file.originalname));
    },
  }),

  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (file.mimetype.match(/\/(jpeg|jpg|png)$/)) {
      return cb(null, true);
    }

    return cb(
      new HttpException('Unsuported file type', HttpStatus.BAD_REQUEST),
      false,
    );
  },
};

const generateFilename = (originalName: string) => {
  const fileExtension = extname(originalName);
  return `${uuid()}${fileExtension}`;
};
export default multerOptions;
