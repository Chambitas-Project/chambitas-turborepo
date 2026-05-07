import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

import { UserRole } from '@chambitas/proto';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ enum: UserRole, example: 'student' })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;

  @ApiProperty({ example: 'uni-1234' })
  @IsString()
  @IsNotEmpty()
  universityId!: string;
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
}

export class UpdateOnboardingDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  career?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  academicCycle?: number;

  @ApiPropertyOptional({ example: 'Tech Corp' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'IT' })
  @IsOptional()
  @IsString()
  sector?: string;
}
