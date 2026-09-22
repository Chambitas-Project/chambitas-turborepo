import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class OAuthProcessDto {
  @ApiProperty({
    description: 'Token de acceso OAuth obtenido de Supabase (fragment de la URL de callback)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  access_token!: string;

  @ApiPropertyOptional({
    description: 'Refresh token OAuth de Supabase (opcional)',
    example: 'v1.eyJhbGciOi...',
  })
  @IsString()
  @IsOptional()
  refresh_token?: string;
}
