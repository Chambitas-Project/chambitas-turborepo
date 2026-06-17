import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsInt, Min, Max, IsString, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'da5f96db-7ec6-44af-90bb-9df3ad38d900' })
  @IsNotEmpty()
  @IsUUID()
  application_id!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ example: 'Excelente trabajo, muy profesional.' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateReviewDto {
  @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: 'Trabajo aceptable, se puede mejorar.' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class ListReviewsDto {
  @ApiPropertyOptional({ description: 'Filtrar por estudiante calificado' })
  @IsOptional()
  @IsUUID()
  student_id?: string;

  @ApiPropertyOptional({ description: 'Filtrar por empleador calificado' })
  @IsOptional()
  @IsUUID()
  employer_id?: string;

  @ApiPropertyOptional({ description: 'Filtrar por proyecto específico' })
  @IsOptional()
  @IsUUID()
  project_id?: string;
}
