import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TrackEventDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  eventType!: string;

  @IsString()
  @IsNotEmpty()
  source!: string;

  @IsNotEmpty()
  payload!: any;
}
