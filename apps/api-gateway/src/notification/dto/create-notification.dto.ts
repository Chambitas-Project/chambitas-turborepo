import { IsString, IsUUID, IsEnum, IsOptional, IsJSON } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  SYSTEM = 0,
  MATCH = 1,
  APPLICATION = 2,
  MESSAGE = 3,
}

export enum NotificationPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
}

export class CreateNotificationDto {
  @ApiProperty({ example: '3400140c-9a39-4a8a-af5d-77595544d9c8' })
  @IsUUID()
  user_id!: string;

  @ApiProperty({ example: 'Nuevo Match Encontrado' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Tienes un nuevo proyecto que coincide con tus habilidades.' })
  @IsString()
  message!: string;

  @ApiProperty({ enum: NotificationType, default: NotificationType.SYSTEM })
  @IsEnum(NotificationType)
  type!: number;

  @ApiProperty({ enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  @IsEnum(NotificationPriority)
  priority!: number;

  @ApiProperty({ example: '{"project_id": "123"}', required: false })
  @IsOptional()
  @IsJSON()
  metadata_json?: string;
}
