import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function GetCitiesAddressesApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'List unique cities', description: 'Get a sorted list of unique city names from all addresses in dropdown format.' }),
    ApiQuery({ name: 'trim', required: false, type: Boolean, description: 'Trim whitespace from city names before returning', example: true }),
    ApiResponse({
      status: 200,
      description: 'Unique sorted city names in dropdown format',
      schema: {
        example: [
          { label: 'Islamabad', value: 'islamabad' },
          { label: 'Karachi', value: 'karachi' },
          { label: 'Lahore', value: 'lahore' }
        ]
      },
    }),
  );
}


