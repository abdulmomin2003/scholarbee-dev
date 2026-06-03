import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProgramTemplateDto {
    @ApiProperty({
        description: 'Program template name',
        example: 'Bachelor of Computer Science',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({
        description: 'Short display name of the program',
        example: 'BS Computer Science',
    })
    @IsString()
    @IsOptional()
    short_name?: string;

    @ApiPropertyOptional({
        description: 'SEO-friendly title key for URL generation and lookups',
        example: 'bs-computer-science',
    })
    @IsString()
    @IsOptional()
    seo_title_key?: string;

    @ApiProperty({
        description: 'Degree level of the program',
        example: 'Bachelors',
    })
    @IsString()
    @IsNotEmpty()
    degree_level: string;

    @ApiPropertyOptional({
        description: 'Field of study',
        example: 'Computer Science',
    })
    @IsString()
    @IsOptional()
    field_of_study?: string;

    @ApiPropertyOptional({
        description: 'Tags associated with the template',
        example: ['technology', 'engineering'],
        type: [String],
    })
    @IsArray()
    @IsOptional()
    tags?: string[];

    @ApiPropertyOptional({
        description: 'Template description',
        example: 'A comprehensive program covering computer science fundamentals',
    })
    @IsString()
    @IsOptional()
    description?: string;
}
