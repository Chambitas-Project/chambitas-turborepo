import { Injectable, Logger } from '@nestjs/common';
import { SendEmailRequest, SendEmailResponse } from '@chambitas/proto';
import { of, Observable } from 'rxjs';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  sendEmail(data: SendEmailRequest): Observable<SendEmailResponse> {
    this.logger.log(`Sending email to: ${data.to}`);
    return of({ success: true, messageId: 'msg-123' });
  }
}
