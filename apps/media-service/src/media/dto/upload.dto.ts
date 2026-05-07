import * as grpc from '@grpc/grpc-js';

export interface UploadRequestDto {
  fileBuffer: Uint8Array;
  mimeType: string;
  folder: string;
}

export interface UploadResponseDto {
  url: string;
}
