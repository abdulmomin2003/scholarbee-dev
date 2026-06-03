import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { UpdateUniversityDto } from '../dto/update-university.dto';

export function UpdateUniversityApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update university', description: 'Update university fields by ID. Requires authentication. Only primary campus admins can update their university.' }),
    ApiParam({ name: 'universityId', required: true, type: String }),
    ApiBody({
      type: UpdateUniversityDto,
      examples: {
        default: {
          value: {
            description: 'Updated description for the university',
            website: 'https://www.updated-university.edu',
            total_students: 5500,
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Updated university', schema: { example: { _id: '651234abcd5678ef9012u001', name: 'LUMS', total_students: 5500 } } }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
    ApiForbiddenResponse({ description: 'Not authorized - must be primary campus admin of the university' }),
  );
}

