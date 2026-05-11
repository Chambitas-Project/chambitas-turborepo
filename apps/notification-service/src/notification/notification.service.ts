import { Injectable, Logger, Inject } from '@nestjs/common';
import { SendEmailRequest, SendEmailResponse } from '@chambitas/proto';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { WelcomeEmail } from '../templates/WelcomeEmail';
import * as React from 'react';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject('RESEND_CLIENT') private readonly resend: Resend,
  ) {}

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
}
