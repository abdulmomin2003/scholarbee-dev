import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export function FindProgramByIdApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get program by ID' }),
    ApiParam({ name: 'id', required: true, type: String }),
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

