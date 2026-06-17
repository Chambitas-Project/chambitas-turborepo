import { Controller, Post, UseInterceptors, UploadedFile, Inject, OnModuleInit, HttpException, HttpStatus, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import { IMediaService } from '@chambitas/proto';

@ApiTags('Media')
@Controller('media')
export class MediaController implements OnModuleInit {
  private mediaService!: IMediaService;

  constructor(@Inject('MEDIA_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.mediaService = this.client.getService<IMediaService>('MediaService');
  }

  @Post('upload')
  @ApiOperation({ summary: 'Subir archivo multimedia' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          enum: ['assets', 'evidence', 'projects', 'profiles'],
          description: 'Categoría de destino para organizar el archivo',
        },
      },
      required: ['file', 'folder'],
    },
  })
  @ApiResponse({ status: 201, description: 'Archivo subido con éxito.' })
  @ApiResponse({ status: 400, description: 'Archivo o categoría inválida.' })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
      // Permitir sólo imágenes (.png, .jpg, .jpeg) y videos (.mp4)
      if (!file.mimetype.match(/\/(jpg|jpeg|png|mp4)$/)) {
        return cb(new BadRequestException('Tipo de archivo no permitido. Solo se aceptan .jpg, .png, .mp4'), false);
      }
      cb(null, true);
    }
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: string
  ) {
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado');
    }

    if (!folder) {
      throw new BadRequestException('La categoría (folder) es obligatoria');
    }

    try {
      const response = await lastValueFrom(
        this.mediaService.UploadFile({
          file_buffer: file.buffer,
          mime_type: file.mimetype,
          folder,
        })
      );
      
      return response;
    } catch (error: any) {
      throw new HttpException(
        error.details || error.message || 'Error al procesar el archivo',
        error.code === 13 ? HttpStatus.INTERNAL_SERVER_ERROR : HttpStatus.BAD_REQUEST, // grpc INTERNAL is 13
      );
    }
  }
}
