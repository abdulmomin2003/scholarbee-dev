import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export function FindOneRegionApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get region by ID' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({
      status: 200,
      description: 'Region document',
      schema: {
        example: {
          _id: '651234abcd5678ef9012r001',
          region_name: 'Punjab',
          country: 'Pakistan',
          cities: ['Lahore', 'Faisalabad', 'Multan'],
          createdAt: '2025-01-01T12:00:00.000Z',
        },
      },
    }),
    ApiNotFoundResponse({ description: 'Region not found' }),
  );
}

