import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export function FindOneOrganizationApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get organization by ID' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({
      status: 200,
      description: 'Organization document',
      schema: {
        example: {
          _id: '651234abcd5678ef9012org1',
          organization_name: 'Ministry of Education',
          organization_type: 'government',
          address: '123 Education Street, Islamabad',
          contact_email: 'contact@moe.gov.pk',
          createdAt: '2025-01-01T12:00:00.000Z',
        },
      },
    }),
    ApiNotFoundResponse({ description: 'Organization not found' }),
  );
}

