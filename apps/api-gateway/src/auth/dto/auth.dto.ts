import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEmail, 
  IsEnum, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsUUID, 
  ValidateIf 
} from 'class-validator';

import { UserRole } from '@chambitas/proto';
import { IsUniversityEmail } from '../validators/university-email.validator';

export class RegisterDto {
  @ApiProperty({ 
    description: 'Correo electrónico. Para students debe ser el email institucional.',
    example: 'u202012345@upc.edu.pe' 
  })
  @IsEmail()
  @IsNotEmpty()
  @IsUniversityEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ 
    enum: UserRole, 
    example: 'student',
    description: 'Rol del usuario. Determina el flujo de onboarding.' 
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;

  @ApiPropertyOptional({ 
    description: 'UUID de la universidad. Requerido únicamente para el rol student.',
    example: 'uuid-de-upc' 
  })
  @ValidateIf(o => o.role === UserRole.STUDENT)
  @IsUUID()
  @IsNotEmpty({ message: 'university_id es requerido para estudiantes' })
  university_id?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ example: 'student' })
  @IsString()
  @IsOptional()
  role?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'NewStrongPassword123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ 
    description: 'Token de acceso enviado por correo (si aplica)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 
  })
  @IsString()
  @IsOptional()
  access_token?: string;
}


