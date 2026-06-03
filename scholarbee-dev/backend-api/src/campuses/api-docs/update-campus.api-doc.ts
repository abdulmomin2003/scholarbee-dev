import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UpdateCampusDto } from '../dto/update-campus.dto';

export function UpdateCampusApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update campus', description: 'Update campus fields by ID. Requires authentication.' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({
      type: UpdateCampusDto,
      examples: {
        default: {
          value: {
            website: 'https://updated.example.edu',
            contact_phone: '+1-555-0101',
            featured: true,
            pictures: ['https://cdn.example.com/newpic.jpg'],
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Updated campus', schema: { example: { _id: '651234abcd5678ef9012c001', name: 'Main Campus' } } }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}


