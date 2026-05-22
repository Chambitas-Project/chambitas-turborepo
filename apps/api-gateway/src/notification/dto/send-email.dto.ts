import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { SendEmailRequest } from '@chambitas/proto';

export class SendEmailDto implements SendEmailRequest {
  @IsEmail()
  to!: string;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;
}
