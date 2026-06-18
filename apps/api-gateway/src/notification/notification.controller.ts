import { Controller, Post, Body, Inject, OnModuleInit, Get, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { INotificationService } from '@chambitas/proto';
import { SendPushNotificationDto } from './dto/send-push-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { firstValueFrom } from 'rxjs';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController implements OnModuleInit {
  private notificationService!: INotificationService;

  constructor(@Inject('NOTIFICATION_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.notificationService = this.client.getService<INotificationService>('NotificationService');
  }

  @Get()
  @ApiOperation({ summary: 'Obtener mis notificaciones' })
  async getMyNotifications(@Request() req: any, @Query('limit') limit?: number, @Query('offset') offset?: number) {
    return firstValueFrom(
      this.notificationService.ListNotifications({
        user_id: req.user.userId,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0,
      })
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    return firstValueFrom(
      this.notificationService.MarkAsRead({
        id,
        user_id: req.user.userId,
      })
    );
  }

  @Post()
  @ApiOperation({ summary: 'Crear una notificación para un usuario (Internal/Admin test)' })
  createNotification(@Body() data: CreateNotificationDto) {
    return this.notificationService.CreateNotification({
      ...data,
      metadata_json: data.metadata_json || '{}',
    });
  }

  @Post('send-push')
  @ApiOperation({ summary: 'Enviar una notificación push directa (Internal/Admin test)' })
  sendPushNotification(@Body() data: SendPushNotificationDto) {
    return this.notificationService.SendPushNotification(data);
  }
}
