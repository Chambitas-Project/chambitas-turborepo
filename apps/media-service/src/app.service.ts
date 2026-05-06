import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { getEnvFiles } from '@chambitas/common';
import { config } from 'dotenv';

// Cargar variables de entorno locales si existen
config({ path: getEnvFiles() });

@Injectable()
export class AppService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFileToCloudinary(buffer: Buffer, mimeType: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const isVideo = mimeType.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';

      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType, folder: 'chambitas' },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (!result) {
            return reject(new Error('Cloudinary response is empty'));
          }
          resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }
}
