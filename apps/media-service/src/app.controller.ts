import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AppService } from './app.service';
import * as grpc from '@grpc/grpc-js';

interface UploadRequest {
  fileBuffer?: any;
  file_buffer?: any;
  mimeType?: string;
  mime_type?: string;
  folder: string;
}

interface UploadResponse {
  url: string;
}

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) { }
}
