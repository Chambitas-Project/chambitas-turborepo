import { Controller, Post, Body, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { INotificationService } from '@chambitas/proto';
import { SendEmailDto } from './dto/send-email.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController implements OnModuleInit {
  private notificationService!: INotificationService;

  constructor(@Inject('NOTIFICATION_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.notificationService = this.client.getService<INotificationService>('NotificationService');
  }

  @Post()
  @ApiOperation({ summary: 'Crear una notificación para un usuario (Internal/Admin test)' })
  createNotification(@Body() data: CreateNotificationDto) {
    return this.notificationService.CreateNotification({
      ...data,
      metadata_json: data.metadata_json || '{}',
    });
  }

  @Post('send-email')
  @ApiOperation({ summary: 'Enviar un correo electrónico (Internal/Admin test)' })
  sendEmail(@Body() data: SendEmailDto) {
    return this.notificationService.SendEmail(data);
  }
}
