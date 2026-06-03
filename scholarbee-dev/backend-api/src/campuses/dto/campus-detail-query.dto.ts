import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CampusDetailQueryDto {
  @ApiProperty({
    description: 'Campus slug to identify the campus',
    example: 'fast-nuces-peshawar-campus',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    description: 'City name to validate the campus location (case-insensitive)',
    example: 'Peshawar',
  })
  @IsString()
  @IsOptional()
  city?: string;
}
