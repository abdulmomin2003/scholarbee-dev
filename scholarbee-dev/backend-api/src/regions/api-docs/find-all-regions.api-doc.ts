import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindAllRegionsApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'List regions', description: 'Retrieve paginated regions with filters and sorting.' }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiQuery({ name: 'region_name', required: false, type: String }),
    ApiQuery({ name: 'country', required: false, type: String }),
    ApiQuery({ name: 'city', required: false, type: String }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' }),
    ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
    ApiQuery({ name: 'populate', required: false, type: Boolean, example: true }),
    ApiResponse({
      status: 200,
      description: 'Paginated regions',
      schema: {
        example: {
          data: [
            {
              _id: '651234abcd5678ef9012r001',
              region_name: 'Punjab',
              country: 'Pakistan',
              cities: ['Lahore', 'Faisalabad'],
              createdAt: '2025-01-01T12:00:00.000Z',
            },
          ],
          meta: { total: 1, page: 1, limit: 10, pages: 1 },
        },
      },
    }),
  );
}

