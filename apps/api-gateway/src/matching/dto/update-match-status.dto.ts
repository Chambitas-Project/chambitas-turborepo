import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMatchStatusDto {
  @ApiProperty({ 
    description: 'Nuevo estado del match',
    example: 'accepted',
    enum: ['pending', 'viewed', 'accepted', 'rejected']
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['pending', 'viewed', 'accepted', 'rejected'])
  status!: string;
}
