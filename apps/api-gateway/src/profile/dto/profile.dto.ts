import { IsString, IsOptional, IsInt, Min, Max, IsJSON } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStudentProfileDto {
  @ApiPropertyOptional({ description: 'Nombre completo del estudiante' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Carrera que estudia' })
  @IsOptional()
  @IsString()
  career?: string;

  @ApiPropertyOptional({ description: 'Ciclo académico (1-12)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  academicCycle?: number;

  @ApiPropertyOptional({ description: 'Biografía' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'ID de la universidad' })
  @IsOptional()
  @IsString()
  universityId?: string;

  @ApiPropertyOptional({ description: 'Bloques de disponibilidad en formato JSON string' })
  @IsOptional()
  @IsJSON()
  availabilityBlocks?: string;
}

export class UpdateEmployerProfileDto {
  @ApiPropertyOptional({ description: 'Nombre de la empresa' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: 'RUC de la empresa' })
  @IsOptional()
  @IsString()
  ruc?: string;

  @ApiPropertyOptional({ description: 'Sector de la empresa' })
  @IsOptional()
  @IsString()
  sector?: string;
}
