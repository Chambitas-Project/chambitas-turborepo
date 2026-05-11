import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMatchStatusDto {
  @ApiProperty({ 
    description: 'Nuevo estado del match',
    example: 'applied',
    enum: ['pending', 'viewed', 'applied', 'rejected']
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['pending', 'viewed', 'applied', 'rejected'])
  status!: string;
}
