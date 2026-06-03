import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiNotFoundResponse } from '@nestjs/swagger';

// file: src/programs/api-docs/find-one-program-by-slug.api-doc.ts
export function FindProgramBySlugApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get program by slug' }),
    ApiParam({ name: 'slug', required: true, type: String }),
    ApiQuery({ name: 'populate', required: false, type: Boolean, example: true }),
    ApiResponse({
      status: 200,
      description: 'Program document',
      schema: {
        example: {
          _id: '651234abcd5678ef9012p001',
          name: 'Bachelor of Computer Science',
          degree_level: 'Bachelors',
          campus_id: '651234abcd5678ef9012c001',
        },
      },
    }),
    ApiNotFoundResponse({ description: 'Program not found' }),
  );
}

