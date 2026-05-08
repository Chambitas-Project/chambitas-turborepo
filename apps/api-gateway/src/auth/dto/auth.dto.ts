import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEmail, 
  IsEnum, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsNumber, 
  IsInt, 
  Min, 
  Max, 
  IsArray, 
  IsUUID, 
  ValidateIf, 
  ArrayMinSize, 
  ArrayMaxSize 
} from 'class-validator';

import { UserRole } from '@chambitas/proto';
import { IsUniversityEmail } from '../validators/university-email.validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @IsUniversityEmail()
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
  university_id!: string;
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


