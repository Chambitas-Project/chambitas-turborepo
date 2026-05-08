import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsArray, IsNumber, IsUUID, IsJSON } from 'class-validator';

export class CreateStudentProfileDto {
  @ApiProperty({ description: 'Nombre completo' })
  @IsString()
  fullName!: string;

  @ApiProperty({ description: 'Carrera' })
  @IsString()
  career!: string;

  @ApiProperty({ description: 'Ciclo académico', minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  academicCycle!: number;

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
  availabilityBlocks?: string;

  @ApiPropertyOptional({ description: 'Habilidades', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}

export class UpdateStudentProfileDto {
  @ApiPropertyOptional({ description: 'Nombre completo' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Carrera' })
  @IsOptional()
  @IsString()
  career?: string;

  @ApiPropertyOptional({ description: 'Ciclo académico' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  academicCycle?: number;

  @ApiPropertyOptional({ description: 'Biografía' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Bloques de disponibilidad en JSON string' })
  @IsOptional()
  @IsJSON()
  availabilityBlocks?: string;

  @ApiPropertyOptional({ description: 'Habilidades', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ description: 'GPA / Promedio' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  gpa?: number;
}

export class CreateEmployerProfileDto {
  @ApiProperty({ description: 'Nombre de la empresa' })
  @IsString()
  companyName!: string;

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

export class UpdateEmployerProfileDto {
  @ApiPropertyOptional({ description: 'Nombre de la empresa' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: 'RUC' })
  @IsOptional()
  @IsString()
  ruc?: string;

  @ApiPropertyOptional({ description: 'Sector' })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional({ description: 'Descripción de la empresa' })
  @IsOptional()
  @IsString()
  description?: string;
}
