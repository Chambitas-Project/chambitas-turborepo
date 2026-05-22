import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { SupabaseService, Database } from '@chambitas/supabase';
import { NotificationService } from '../notification/notification.service';

@Processor('notification-queue')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly notificationService: NotificationService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { notification_id, to, subject } = job.data;
    this.logger.log(`Checking notification status for ID: ${notification_id}`);

    // 1. Consultar el estado de la notificación en la DB
    const { data: notification, error } = await this.supabase
      .getClient<Database>()
      .from('notifications')
      .select('*')
      .eq('id', notification_id)
      .single();

    if (error || !notification) {
      this.logger.error(`Notification ${notification_id} not found.`);
      return { success: false };
    }

    // 2. Si ya fue leída, no enviamos correo
    if (notification.read_at) {
      this.logger.log(`Notification ${notification_id} was already read. Skipping email.`);
      return { success: true, skipped: true };
    }

    // 3. Si no ha sido leída, enviamos el correo de respaldo
    this.logger.log(`Notification ${notification_id} is unread. Sending backup email to ${to}...`);
    
    // Usamos el método sendEmail del servicio (que ya tiene Resend y React Email)
    const result = await this.notificationService.sendEmail({
      to,
      subject,
      body: notification.message, // O una versión formateada
    }).toPromise();

    if (result?.success) {
      // 4. Marcar que el correo fue enviado
      await this.supabase
        .getClient<Database>()
        .from('notifications')
        .update({ email_sent_at: new Date().toISOString() })
        .eq('id', notification_id);
      
      this.logger.log(`Backup email sent for notification ${notification_id}`);
    }

    return { success: result?.success };
  }
}
