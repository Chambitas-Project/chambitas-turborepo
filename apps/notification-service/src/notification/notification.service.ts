import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { 
  SendEmailRequest, 
  SendEmailResponse, 
  CreateNotificationRequest, 
  CreateNotificationResponse,
  NotificationType,
  NotificationPriority
} from '@chambitas/proto';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { SupabaseService, Database } from '@chambitas/supabase';
import { WelcomeEmail } from '../templates/WelcomeEmail';
import * as React from 'react';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject('RESEND_CLIENT') private readonly resend: Resend,
    private readonly supabase: SupabaseService,
    @InjectQueue('notification-queue') private readonly notificationQueue: Queue,
  ) {}

  createNotification(data: CreateNotificationRequest): Observable<CreateNotificationResponse> {
    this.logger.log(`Creating notification for user: ${data.user_id}`);

    const typeStr = this.mapNotificationType(data.type);
    const priorityStr = this.mapNotificationPriority(data.priority);

    return from(
      this.supabase.getClient<Database>().from('notifications').insert({
        user_id: data.user_id,
        title: data.title,
        message: data.message,
        type: typeStr as any,
        priority: priorityStr as any,
        metadata: JSON.parse(data.metadata_json || '{}'),
      }).select().single()
    ).pipe(
      switchMap((response) => {
        if (response.error) {
          this.logger.error(`Error persisting notification: ${response.error.message}`);
          return of({ success: false, notification_id: '' });
        }
        
        const notification = response.data;
        this.logger.log(`Notification persisted with ID: ${notification.id}`);

        // RESEND-READY: El envío de correos está deshabilitado temporalmente para ahorrar costos.
        // Solo usaremos notificaciones in-app persistidas en la DB.
        // Para re-habilitar, descomentar el bloque siguiente:
        /*
        return from(this.supabase.getAdminClient().auth.admin.getUserById(data.user_id)).pipe(
          switchMap((userRes) => {
            const email = userRes.data?.user?.email;
            
            if (email) {
              return from(this.notificationQueue.add('send-backup-email', {
                notification_id: notification.id,
                to: email,
                subject: `Nueva notificación: ${data.title}`,
              }, {
                delay: 300000, // 5 minutos
                removeOnComplete: true,
              })).pipe(
                map(() => ({ success: true, notification_id: notification.id }))
              );
            }
            
            return of({ success: true, notification_id: notification.id });
          })
        );
        */

        return of({ success: true, notification_id: notification.id });
      }),
      catchError((error) => {
        this.logger.error(`Exception in createNotification: ${error.message}`);
        return of({ success: false, notification_id: '' });
      })
    );
  }

  sendEmail(data: SendEmailRequest): Observable<SendEmailResponse> {
    this.logger.log(`Sending email to: ${data.to} with subject: ${data.subject}`);

    const userName = data.to.split('@')[0] || 'Usuario';

    return from(render(React.createElement(WelcomeEmail, { userName }))).pipe(
      switchMap((emailHtml) =>
        from(
          this.resend.emails.send({
            from: 'Chambitas <onboarding@resend.dev>',
            to: data.to,
            subject: data.subject,
            html: emailHtml,
          }),
        ),
      ),
      map((response: any) => {
        if (response.error) {
          this.logger.error(`Error sending email: ${JSON.stringify(response.error)}`);
          return { success: false, messageId: '' };
        }
        return { success: true, messageId: response.data?.id || '' };
      }),
      catchError((error) => {
        this.logger.error(`Exception sending email: ${error.message}`);
        return of({ success: false, messageId: '' });
      }),
    );
  }

  private mapNotificationType(type: NotificationType): string {
    switch (type) {
      case NotificationType.MATCH: return 'MATCH';
      case NotificationType.APPLICATION: return 'APPLICATION';
      case NotificationType.MESSAGE: return 'MESSAGE';
      case NotificationType.SYSTEM:
      default: return 'SYSTEM';
    }
  }

  private mapNotificationPriority(priority: NotificationPriority): string {
    switch (priority) {
      case NotificationPriority.LOW: return 'LOW';
      case NotificationPriority.HIGH: return 'HIGH';
      case NotificationPriority.MEDIUM:
      default: return 'MEDIUM';
    }
  }
}
