import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindAllProgramTemplatesApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'List program templates', description: 'Retrieve paginated program templates with filters and sorting.' }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiQuery({ name: 'name', required: false, type: String }),
    ApiQuery({ name: 'degree_level', required: false, type: String }),
    ApiQuery({ name: 'field_of_study', required: false, type: String }),
    ApiQuery({ name: 'seo_title_key', required: false, type: String, example: 'bs-computer-science' }),
    ApiQuery({ name: 'tags', required: false, type: [String] }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' }),
    ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
    ApiResponse({
      status: 200,
      description: 'Paginated program templates',
      schema: {
        example: {
          data: [
            {
              _id: '6512pt01',
              name: 'Bachelor of Computer Science',
              short_name: 'BS Computer Science',
              seo_title_key: 'bs-computer-science',
              degree_level: 'Bachelors',
              field_of_study: 'Computer Science',
              tags: ['technology', 'engineering'],
              createdAt: '2025-01-01T12:00:00.000Z',
            },
          ],
          meta: { total: 1, page: 1, limit: 10, pages: 1 },
        },
      },
    }),
  );
}
