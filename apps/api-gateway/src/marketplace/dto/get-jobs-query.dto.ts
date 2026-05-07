import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { GetJobsRequest } from '@chambitas/proto';

export class GetJobsQueryDto implements GetJobsRequest {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  employerId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}
