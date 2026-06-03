import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateProgramTemplateDto } from '../dto/create-program-template.dto';

export function CreateProgramTemplateApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create program template (Super Admin)' }),
    ApiBody({
      type: CreateProgramTemplateDto,
      examples: {
        default: {
          value: {
            name: 'Bachelor of Computer Science',
            short_name: 'BS Computer Science',
            seo_title_key: 'bs-computer-science',
            degree_level: 'Bachelors',
            field_of_study: 'Computer Science',
            tags: ['technology', 'engineering'],
            description: 'A comprehensive program covering computer science fundamentals',
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Program template created', schema: { example: { _id: '6512pt01', name: 'Bachelor of Computer Science', short_name: 'BS Computer Science', seo_title_key: 'bs-computer-science', degree_level: 'Bachelors' } } }),
  );
}
