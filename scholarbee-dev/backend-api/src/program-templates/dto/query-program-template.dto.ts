import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProgramTemplateDto {
    @ApiPropertyOptional({
        description: 'Search term for name, degree_level, or description',
        example: 'computer',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Filter by name',
        example: 'Computer Science',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        description: 'Filter by degree level',
        example: 'Bachelors',
    })
    @IsOptional()
    @IsString()
    degree_level?: string;

    @ApiPropertyOptional({
        description: 'Filter by field of study',
        example: 'Computer Science',
    })
    @IsOptional()
    @IsString()
    field_of_study?: string;

    @ApiPropertyOptional({
        description: 'Filter by SEO title key',
        example: 'bs-computer-science',
    })
    @IsOptional()
    @IsString()
    seo_title_key?: string;

    @ApiPropertyOptional({
        description: 'Filter by tags',
        example: ['technology'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({
        description: 'Page number',
        example: 1,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Sort by field',
        example: 'createdAt',
        default: 'createdAt',
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({
        description: 'Sort order',
        example: 'desc',
        enum: ['asc', 'desc'],
        default: 'desc',
    })
    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc' = 'desc';
}
