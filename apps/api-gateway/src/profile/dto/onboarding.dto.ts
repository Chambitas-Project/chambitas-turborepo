import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsString, 
  IsInt, 
  Min, 
  Max, 
  IsArray, 
  IsNotEmpty, 
  ArrayMinSize, 
  ArrayMaxSize,
  ValidateNested,
  IsOptional,
} from 'class-validator';

/**
 * Nivel de dominio de una habilidad.
 * 1 = Básico | 2 = Elemental | 3 = Intermedio | 4 = Avanzado | 5 = Experto
 */
export class SkillInputDto {
  @ApiProperty({ 
    description: 'Nombre de la habilidad del catálogo (GET /profile/skills)',
    example: 'TypeScript'
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ 
    description: 'Nivel de dominio: 1=Básico, 2=Elemental, 3=Intermedio, 4=Avanzado, 5=Experto',
    minimum: 1,
    maximum: 5,
    default: 1,
    example: 3
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  proficiency_level?: number;
}

export class StudentOnboardingDto {
  @ApiProperty({ description: 'Nombre completo', example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  full_name!: string;

  @ApiProperty({ description: 'Carrera', example: 'Ingeniería de Software' })
  @IsString()
  @IsNotEmpty()
  career!: string;

  @ApiProperty({ description: 'Ciclo académico (1-12)', minimum: 1, maximum: 12, example: 6 })
  @IsInt()
  @Min(1)
  @Max(12)
  academic_cycle!: number;

  @ApiProperty({ 
    description: 'Entre 3 y 10 habilidades con nivel de dominio. Usa GET /profile/skills para ver el catálogo.',
    type: [SkillInputDto],
    example: [
      { name: 'TypeScript', proficiency_level: 4 },
      { name: 'NestJS', proficiency_level: 3 },
      { name: 'PostgreSQL', proficiency_level: 2 }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillInputDto)
  @ArrayMinSize(3, { message: 'Debes seleccionar al menos 3 habilidades' })
  @ArrayMaxSize(10, { message: 'Puedes seleccionar máximo 10 habilidades' })
  skill_inputs!: SkillInputDto[];
}

export class EmployerOnboardingDto {
  @ApiProperty({ description: 'Nombre de la empresa', example: 'Chambitas S.A.C' })
  @IsString()
  @IsNotEmpty()
  company_name!: string;

  @ApiProperty({ description: 'RUC', example: '20123456789' })
  @IsString()
  @IsNotEmpty()
  ruc!: string;

  @ApiProperty({ description: 'Sector de la empresa', example: 'Tecnología' })
  @IsString()
  @IsNotEmpty()
  sector!: string;

  @ApiProperty({ 
    description: 'Descripción de la empresa', 
    example: 'Somos una startup enfocada en conectar talento universitario con proyectos reales.' 
  })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
