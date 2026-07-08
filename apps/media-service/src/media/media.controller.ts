import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { MediaService } from './media.service';
import * as grpc from '@grpc/grpc-js';
import { UploadRequestDto, UploadResponseDto } from './dto/upload.dto';

@Controller()
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private readonly mediaService: MediaService) {}

  @GrpcMethod('MediaService', 'UploadFile')
  async uploadFile(data: UploadRequestDto, metadata: grpc.Metadata): Promise<UploadResponseDto> {
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
      const fileData = (data as any).fileBuffer || (data as any).file_buffer;
      if (!fileData) {
        this.logger.error('No file data received in gRPC payload');
      }
      const mime = (data as any).mimeType || (data as any).mime_type || 'application/octet-stream';
      const buffer = Buffer.from(fileData);
      const url = await this.mediaService.uploadFileToCloudinary(
        buffer, 
        mime, 
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
