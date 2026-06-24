import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { v2 as cloudinary } from 'cloudinary';

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
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Tipo de archivo no permitido. Se aceptan: jpg, jpeg, png, gif, webp',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadExerciseMedia(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException(
        `Cloudinary no configurado. Faltan: ${[
          !cloudName && 'CLOUDINARY_CLOUD_NAME',
          !apiKey && 'CLOUDINARY_API_KEY',
          !apiSecret && 'CLOUDINARY_API_SECRET',
        ].filter(Boolean).join(', ')}`,
      );
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

    const url = await new Promise<string>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'unique-gym/exercises', resource_type: 'image' },
          (error, result) => {
            if (error || !result) {
              return reject(new InternalServerErrorException(
                `Cloudinary error: ${error?.message ?? 'sin respuesta'}`,
              ));
            }
            resolve(result.secure_url);
          },
        )
        .end(file.buffer);
    });

    return { url };
  }
}
