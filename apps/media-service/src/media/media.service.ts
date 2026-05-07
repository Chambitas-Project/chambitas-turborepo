import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { getEnvFiles } from '@chambitas/common';
import { config } from 'dotenv';

// Cargar variables de entorno locales si existen
config({ path: getEnvFiles() });

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFileToCloudinary(
    buffer: Buffer, 
    mimeType: string, 
    folder: string, 
    userId: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const fullPath = `chambitas/${folder}`;
      const publicId = `${folder}_${userId}_${Date.now()}`;

      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          resource_type: 'auto', // Detecta si es imagen o video automáticamente
          folder: fullPath,
          public_id: publicId
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (!result) {
            return reject(new Error('Cloudinary response is empty'));
          }
          
          this.logger.log(`[MediaService] File uploaded successfully as: ${publicId} in folder: ${fullPath}`);
          resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }
}
