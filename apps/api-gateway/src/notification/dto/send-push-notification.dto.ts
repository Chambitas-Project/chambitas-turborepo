import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { SendPushNotificationRequest } from '@chambitas/proto';

export class SendPushNotificationDto implements SendPushNotificationRequest {
  @IsString()
  @IsNotEmpty()
  user_id!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsString()
  @IsOptional()
  data_json?: string;
}
