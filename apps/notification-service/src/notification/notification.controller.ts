import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { 
  SendPushNotificationRequest, 
  SendPushNotificationResponse, 
  CreateNotificationRequest, 
  CreateNotificationResponse 
} from '@chambitas/proto';
import { Observable } from 'rxjs';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @GrpcMethod('NotificationService', 'CreateNotification')
  createNotification(data: CreateNotificationRequest): Observable<CreateNotificationResponse> {
    return this.notificationService.createNotification(data);
  }

  @GrpcMethod('NotificationService', 'SendPushNotification')
  sendPushNotification(data: SendPushNotificationRequest): Observable<SendPushNotificationResponse> {
    return this.notificationService.sendPushNotification(data);
  }
}
