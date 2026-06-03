import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindAllOrganizationsApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'List organizations', description: 'Retrieve paginated organizations with filters and sorting.' }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiQuery({ name: 'organization_name', required: false, type: String }),
    ApiQuery({ name: 'organization_type', required: false, type: String, enum: ['government', 'private', 'university'] }),
    ApiQuery({ name: 'address', required: false, type: String }),
    ApiQuery({ name: 'contact_email', required: false, type: String }),
    ApiQuery({ name: 'contact_phone', required: false, type: String }),
    ApiQuery({ name: 'website_url', required: false, type: String }),
    ApiQuery({ name: 'country', required: false, type: String }),
    ApiQuery({ name: 'region', required: false, type: String }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' }),
    ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
    ApiQuery({ name: 'populate', required: false, type: Boolean, example: true }),
    ApiResponse({
      status: 200,
      description: 'Paginated organizations',
      schema: {
        example: {
          data: [
            {
              _id: '651234abcd5678ef9012org1',
              organization_name: 'Ministry of Education',
              organization_type: 'government',
              createdAt: '2025-01-01T12:00:00.000Z',
            },
          ],
          meta: { total: 1, page: 1, limit: 10, pages: 1 },
        },
      },
    }),
  );
}

