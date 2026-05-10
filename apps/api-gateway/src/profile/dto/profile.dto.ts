import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsArray, IsNumber, IsUUID, IsJSON } from 'class-validator';

export class CreateStudentProfileDto {
  @ApiProperty({ description: 'Nombre completo' })
  @IsString()
  full_name!: string;

  @ApiProperty({ description: 'Carrera' })
  @IsString()
  career!: string;

  @ApiProperty({ description: 'Ciclo académico', minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  academic_cycle!: number;

  @ApiProperty({ description: 'ID de la universidad (UUID)' })
  @IsUUID()
  university_id!: string;

  @ApiPropertyOptional({ description: 'Biografía' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Bloques de disponibilidad en JSON string' })
  @IsOptional()
  @IsJSON()
  availability_blocks?: string;

  @ApiPropertyOptional({ description: 'Habilidades', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}

export class CreateEmployerProfileDto {
  @ApiProperty({ description: 'Nombre de la empresa' })
  @IsString()
  company_name!: string;

  @ApiProperty({ description: 'RUC' })
  @IsString()
  ruc!: string;

  @ApiProperty({ description: 'Sector' })
  @IsString()
  sector!: string;

  @ApiPropertyOptional({ description: 'Descripción de la empresa' })
  @IsOptional()
  @IsString()
  description?: string;
}
