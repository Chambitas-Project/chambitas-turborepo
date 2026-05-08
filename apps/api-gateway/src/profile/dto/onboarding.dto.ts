import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsInt, 
  Min, 
  Max, 
  IsArray, 
  IsNotEmpty, 
  ArrayMinSize, 
  ArrayMaxSize 
} from 'class-validator';

export class StudentOnboardingDto {
  @ApiProperty({ description: 'Nombre completo', example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ description: 'Carrera', example: 'Ingeniería de Software' })
  @IsString()
  @IsNotEmpty()
  career!: string;

  @ApiProperty({ description: 'Ciclo académico', minimum: 1, maximum: 12, example: 6 })
  @IsInt()
  @Min(1)
  @Max(12)
  academicCycle!: number;

  @ApiProperty({ 
    description: 'Habilidades (entre 3 y 10)', 
    type: [String],
    example: ['TypeScript', 'NestJS', 'PostgreSQL']
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(3, { message: 'Debes seleccionar al menos 3 habilidades' })
  @ArrayMaxSize(10, { message: 'Puedes seleccionar máximo 10 habilidades' })
  skills!: string[];
}

export class EmployerOnboardingDto {
  @ApiProperty({ description: 'Nombre de la empresa', example: 'Chambitas S.A.C' })
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @ApiProperty({ description: 'RUC (Válido para Perú)', example: '20123456789' })
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
