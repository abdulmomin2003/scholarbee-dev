import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { DegreeLevelEnum } from 'src/common/constants/shared.constants';

export function FindAllProgramsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'List programs', description: 'Retrieve paginated programs with filters and sorting. Authentication optional.' }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiQuery({ name: 'name', required: false, type: String }),
    ApiQuery({ name: 'major', required: false, type: String }),
    ApiQuery({ name: 'duration', required: false, type: String, enum: ['12 Months', '18 Months', '24 Months', '36 Months', '48 Months', '60 Months'] }),
    ApiQuery({ name: 'mode_of_study', required: false, type: String }),
    ApiQuery({ name: 'university_id', required: false, type: String }),
    ApiQuery({ name: 'campus_id', required: false, type: String }),
    ApiQuery({ name: 'campus_ids', required: false, type: [String], description: 'Multiple campus IDs' }),
    ApiQuery({ name: 'degree_level', required: false, type: String, enum: DegreeLevelEnum }),
    ApiQuery({ name: 'academic_departments', required: false, type: String }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String }),
    ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
    ApiQuery({ name: 'populate', required: false, type: Boolean, example: true }),
    ApiResponse({
      status: 200,
      description: 'Paginated programs',
      schema: {
        example: {
          data: [
            {
              _id: '651234abcd5678ef9012p001',
              name: 'Bachelor of Computer Science',
              degree_level: 'Bachelors',
              createdAt: '2025-01-01T12:00:00.000Z',
            },
          ],
          meta: { total: 1, page: 1, limit: 10, pages: 1 },
        },
      },
    }),
  );
}

