import { Controller, Post, Body, Inject, OnModuleInit, Get, Patch, Param, UseGuards, Request, Query, Sse, MessageEvent } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { INotificationService } from '@chambitas/proto';
import { SendPushNotificationDto } from './dto/send-push-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SupabaseService } from '@chambitas/supabase';
import { firstValueFrom, Observable, interval, map, merge } from 'rxjs';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController implements OnModuleInit {
  private notificationService!: INotificationService;

  constructor(
    @Inject('NOTIFICATION_PACKAGE') private client: ClientGrpc,
    private readonly supabaseService: SupabaseService,
  ) {}

  onModuleInit() {
    this.notificationService = this.client.getService<INotificationService>('NotificationService');
  }

  @Sse('stream')
  @ApiOperation({ summary: 'Stream SSE de notificaciones en tiempo real para el usuario autenticado' })
  streamNotifications(@Request() req: any): Observable<MessageEvent> {
    const userId = req.user.id || req.user.userId;

    const notifications$ = new Observable<MessageEvent>((subscriber) => {
      // Suscripción en tiempo real a la tabla notifications de Supabase para este userId
      const supabase = this.supabaseService.getClient();
      const channelName = `realtime:notifications:${userId}:${Date.now()}`;

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            subscriber.next({
              data: {
                type: 'NEW_NOTIFICATION',
                notification: payload.new,
              },
            } as MessageEvent);
          }
        )
        .subscribe();

      // Enviar evento de conexión inicial exitosa
      subscriber.next({
        data: {
          type: 'CONNECTED',
          user_id: userId,
        },
      } as MessageEvent);

      // Cleanup al desconectarse el cliente
      return () => {
        supabase.removeChannel(channel);
      };
    });

    // Enviar un heartbeat (ping) cada 25 segundos para mantener activa la conexión SSE
    const heartbeat$ = interval(25000).pipe(
      map(() => ({
        data: { type: 'PING' },
      } as MessageEvent))
    );

    return merge(notifications$, heartbeat$);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener mis notificaciones' })
  async getMyNotifications(@Request() req: any, @Query('limit') limit?: number, @Query('offset') offset?: number) {
    const userId = req.user.id || req.user.userId;
    return firstValueFrom(
      this.notificationService.ListNotifications({
        user_id: userId,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0,
      })
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id || req.user.userId;
    return firstValueFrom(
      this.notificationService.MarkAsRead({
        id,
        user_id: userId,
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
