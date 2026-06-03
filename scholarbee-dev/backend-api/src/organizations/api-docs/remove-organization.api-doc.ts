import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function RemoveOrganizationApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete organization (admin)', description: 'Delete an organization by ID. Requires admin authentication.' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({
      status: 200,
      description: 'Deleted organization',
      schema: {
        example: {
          _id: '651234abcd5678ef9012org1',
          organization_name: 'Ministry of Education',
          deleted: true,
        },
      },
    }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
  );
}

