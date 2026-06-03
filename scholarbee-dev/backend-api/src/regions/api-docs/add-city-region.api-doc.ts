import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function AddCityToRegionApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Add city to region (admin)', description: 'Add a city to the cities array of a region. Requires admin authentication.' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            example: 'Sialkot',
          },
        },
        required: ['city'],
      },
      examples: {
        default: {
          value: {
            city: 'Sialkot',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'City added to region',
      schema: {
        example: {
          _id: '651234abcd5678ef9012r001',
          region_name: 'Punjab',
          cities: ['Lahore', 'Faisalabad', 'Sialkot'],
        },
      },
    }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}

