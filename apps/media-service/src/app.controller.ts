import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AppService } from './app.service';
import * as grpc from '@grpc/grpc-js';

interface UploadRequest {
  fileBuffer: any; // gRPC envia Buffer como array o object. Lo recibimos y convertimos
  mimeType: string;
  folder: string;
}

interface UploadResponse {
  url: string;
}

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @GrpcMethod('MediaService', 'UploadFile')
  async uploadFile(data: UploadRequest, metadata: grpc.Metadata): Promise<UploadResponse> {
    // 1. Seguridad: Extraer user-id de metadatos
    const userId = metadata.get('user-id')[0]?.toString();
    if (!userId) {
      throw new RpcException({
        code: grpc.status.UNAUTHENTICATED,
        message: 'No se encontró el ID de usuario en los metadatos',
      });
    }

    // 2. Validación: Whitelist de categorías
    const allowedFolders = ['assets', 'evidence', 'projects', 'profiles'];
    if (!allowedFolders.includes(data.folder)) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: `Categoría no permitida: ${data.folder}. Opciones: ${allowedFolders.join(', ')}`,
      });
    }

    try {
      // Convertir a Buffer en caso que gRPC lo mande en otro formato
      const buffer = Buffer.from(data.fileBuffer);
      const url = await this.appService.uploadFileToCloudinary(
        buffer, 
        data.mimeType, 
        data.folder, 
        userId
      );
      
      return { url };
    } catch (error: any) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'No se pudo subir la imagen',
      });
    }
  }
}
