import { IsString, IsNotEmpty } from 'class-validator';

export class TrackEventDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  eventType!: string;

  @IsString()
  @IsNotEmpty()
  source!: string;

  @IsNotEmpty()
  payload!: any;
}
