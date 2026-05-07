import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Min, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Desarrollo de App Mobile' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Necesitamos una app en React Native...' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 500.0 })
  @IsNumber()
  @Min(0)
  budget!: number;

  @ApiProperty({ example: ['React Native', 'Node.js', 'Firebase'] })
  @IsArray()
  @IsString({ each: true })
  requirements!: string[];

  @ApiProperty({ example: 'Software Development' })
  @IsString()
  service_category!: string;

  @ApiPropertyOptional({ example: ['uuid-1', 'uuid-2'], description: 'Lista de IDs de universidades (opcional para proyectos globales)' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  university_ids?: string[];

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_hours_week?: number;
}

export class UpdateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  service_category?: string;

  @ApiPropertyOptional({ example: ['uuid-1', 'uuid-2'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  university_ids?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  max_hours_week?: number;
}
