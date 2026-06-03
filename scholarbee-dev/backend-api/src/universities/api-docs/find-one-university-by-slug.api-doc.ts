import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export function FindOneUniversityBySlugApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get university by slug' }),
    ApiParam({ name: 'slug', required: true, type: String }),
    ApiResponse({
      status: 200,
      description: 'University document',
      schema: {
        example: {
          _id: '651234abcd5678ef9012u001',
          name: 'Lahore University of Management Sciences',
          founded: '1984-01-01T00:00:00.000Z',
          website: 'https://www.lums.edu.pk',
        },
      },
    }),
    ApiNotFoundResponse({ description: 'University not found' }),
  );
}

