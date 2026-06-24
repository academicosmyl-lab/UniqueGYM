import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

@Controller('upload')
export class UploadController {
  @Post('exercise-media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads'),
        filename: (_req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.random().toString(36).slice(2);
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Tipo de archivo no permitido. Se aceptan: jpg, jpeg, png, gif, webp`,
            ),
            false,
          );
        }
      },
    }),
  )
  uploadExerciseMedia(
    @UploadedFile() file: Express.Multer.File,
  ): { url: string } {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }
    return { url: `/uploads/${file.filename}` };
  }
}
