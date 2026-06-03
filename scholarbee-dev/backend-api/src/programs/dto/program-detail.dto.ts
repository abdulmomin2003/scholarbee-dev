import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProgramDetailDto {
  @ApiPropertyOptional({
    description: 'Campus slug to filter programs by campus',
    example: 'fast-nuces-peshawar-campus',
  })
  @IsOptional()
  @IsString()
  campus_slug?: string;

  @ApiPropertyOptional({
    description: 'Program template SEO title key (e.g., "bs-computer-science")',
    example: 'bs-computer-science',
  })
  @IsOptional()
  @IsString()
  seo_title_key?: string;

  @ApiPropertyOptional({
    description: 'City name (case-insensitive)',
    example: 'Karachi',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Degree level (case-insensitive)',
    example: 'Bachelors',
  })
  @IsOptional()
  @IsString()
  degree_level?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of results per page', example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}
