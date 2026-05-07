import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { CreateJobRequest } from '@chambitas/proto';

export class CreateJobDto implements CreateJobRequest {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  employerId!: string;

  @IsNumber()
  salary!: number;

  @IsString()
  location!: string;

  @IsString()
  category!: string;
}
