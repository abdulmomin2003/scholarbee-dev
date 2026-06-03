import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export function FindOneProgramTemplateApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get program template by ID' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Program template', schema: { example: { _id: '6512pt01', name: 'Bachelor of Computer Science', short_name: 'BS Computer Science', seo_title_key: 'bs-computer-science', degree_level: 'Bachelors', field_of_study: 'Computer Science' } } }),
    ApiNotFoundResponse({ description: 'Program template not found' }),
  );
}
