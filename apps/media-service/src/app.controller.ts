import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AppService } from './app.service';
import * as grpc from '@grpc/grpc-js';

interface UploadRequest {
  fileBuffer: any; // gRPC envia Buffer como array o object. Lo recibimos y convertimos
  mimeType: string;
}

interface UploadResponse {
  url: string;
}

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @GrpcMethod('MediaService', 'UploadFile')
  async uploadFile(data: UploadRequest): Promise<UploadResponse> {
    try {
      // Convertir a Buffer en caso que gRPC lo mande en otro formato
      const buffer = Buffer.from(data.fileBuffer);
      const url = await this.appService.uploadFileToCloudinary(buffer, data.mimeType);
      
      this.logger.log(`Uploaded file with mimetype ${data.mimeType} successfully.`);
      
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
