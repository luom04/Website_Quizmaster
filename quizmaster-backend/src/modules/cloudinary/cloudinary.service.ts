/// <reference types="multer" />
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImageBuffer(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadApiResponse> {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    const uploadFolder =
      folder ||
      this.configService.get<string>('CLOUDINARY_FOLDER') ||
      'quizmaster/avatars';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: uploadFolder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(
              new BadRequestException('Could not upload image to Cloudinary.'),
            );
            return;
          }

          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string) {
    if (!publicId) {
      return null;
    }

    return cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });
  }
}
