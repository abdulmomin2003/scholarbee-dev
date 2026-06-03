import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function RemoveCityFromRegionApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Remove city from region (admin)', description: 'Remove a city from the cities array of a region. Requires admin authentication.' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiParam({ name: 'city', required: true, type: String }),
    ApiResponse({
      status: 200,
      description: 'City removed from region',
      schema: {
        example: {
          _id: '651234abcd5678ef9012r001',
          region_name: 'Punjab',
          cities: ['Lahore', 'Faisalabad'],
        },
      },
    }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}

