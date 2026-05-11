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
  IsNumber,
  IsUUID,
  IsObject,
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
  @ApiProperty({ description: 'Nombre completo', example: 'Rodrigo López' })
  @IsString()
  @IsNotEmpty()
  full_name!: string;

  @ApiProperty({ description: 'ID de la carrera', example: 'uuid-de-la-carrera' })
  @IsString()
  @IsNotEmpty()
  career_id!: string;

  @ApiProperty({ description: 'Ciclo académico (1-12)', minimum: 1, maximum: 12, example: 6 })
  @IsInt()
  @Min(1)
  @Max(12)
  academic_cycle!: number;

  @ApiPropertyOptional({ description: 'Breve biografía del estudiante', example: 'Apasionado por el desarrollo web y la IA.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Promedio Ponderado (GPA)', minimum: 0, maximum: 20, example: 15.5 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(20)
  gpa?: number;

  @ApiPropertyOptional({ description: 'Horas disponibles por semana', minimum: 1, maximum: 40, example: 10 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(40)
  weekly_availability?: number;

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

  @ApiProperty({ 
    description: 'Bloques de disponibilidad semanal (32 bits por día)', 
    example: { mon: '11110000...', tue: '00001111...', } 
  })
  @IsOptional()
  availability_blocks?: Record<string, string>;

  @ApiPropertyOptional({ description: 'URL de evidencia para validación de GPA', example: 'https://storage.com/file.pdf' })
  @IsOptional()
  @IsString()
  evidence_url?: string;
}

export class EmployerOnboardingDto {
  @ApiProperty({ description: 'Nombre de la empresa', example: 'Chambitas S.A.C' })
  @IsString()
  @IsNotEmpty()
  company_name!: string;

  @ApiProperty({ description: 'Nombre comercial / Marca', example: 'Chambitas' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ 
    description: 'Descripción de la empresa', 
    example: 'Somos una startup enfocada en conectar talento universitario con proyectos reales.' 
  })
  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class UpdateStudentProfileDto {
  @ApiPropertyOptional() @IsString() @IsOptional() full_name?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() career_id?: string;
  @ApiPropertyOptional() @IsInt() @Min(1) @Max(12) @IsOptional() academic_cycle?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() bio?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() gpa?: number;
  @ApiPropertyOptional() @IsObject() @IsOptional() availability_blocks?: Record<string, string>;
  @ApiPropertyOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SkillInputDto) @IsOptional() skill_inputs?: SkillInputDto[];
  @ApiPropertyOptional() @IsString() @IsOptional() evidence_url?: string;
  @ApiPropertyOptional() @IsOptional() is_gpa_verified?: boolean;
}

export class UpdateEmployerProfileDto {
  @ApiPropertyOptional() @IsString() @IsOptional() company_name?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() name?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
}
