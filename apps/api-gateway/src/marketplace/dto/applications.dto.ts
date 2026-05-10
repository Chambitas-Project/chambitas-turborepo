import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ example: 'Me interesa mucho este proyecto por...' })
  @IsString()
  @MaxLength(500)
  cover_note!: string;

  @ApiProperty({ example: 'uuid-proyecto' })
  @IsUUID('4')
  project_id!: string;
}

export class UpdateApplicationStatusDto {
  @ApiProperty({ example: 'reviewing', enum: ['pending', 'reviewing', 'accepted', 'rejected'] })
  @IsString()
  status!: string;
}
