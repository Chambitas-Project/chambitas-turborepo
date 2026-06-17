import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  SendPushNotificationRequest,
  SendPushNotificationResponse,
  CreateNotificationRequest,
  CreateNotificationResponse,
  NotificationType,
  NotificationPriority
} from '@chambitas/proto';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SupabaseService, Database } from '@chambitas/supabase';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly supabase: SupabaseService,
    @InjectQueue('notification-queue') private readonly notificationQueue: Queue,
  ) { }

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

        // Enqueue push notification job via BullMQ (Redis)
        return from(this.notificationQueue.add('send-push', {
          user_id: data.user_id,
          title: data.title,
          body: data.message,
          data_json: data.metadata_json,
        }, {
          removeOnComplete: true,
        })).pipe(
          map(() => ({ success: true, notification_id: notification.id }))
        );
      }),
      catchError((error) => {
        this.logger.error(`Exception in createNotification: ${error.message}`);
        return of({ success: false, notification_id: '' });
      })
    );
  }

  sendPushNotification(data: SendPushNotificationRequest): Observable<SendPushNotificationResponse> {
    this.logger.log(`Directly enqueueing push notification for: ${data.user_id} with title: ${data.title}`);

    return from(
      this.notificationQueue.add('send-push', {
        user_id: data.user_id,
        title: data.title,
        body: data.body,
        data_json: data.data_json,
      }, {
        removeOnComplete: true,
      })
    ).pipe(
      map((job) => {
        this.logger.log(`Push notification job enqueued with id: ${job.id}`);
        return { success: true, message_id: job.id || '' };
      }),
      catchError((error) => {
        this.logger.error(`Exception enqueueing push notification: ${error.message}`);
        return of({ success: false, message_id: '' });
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
