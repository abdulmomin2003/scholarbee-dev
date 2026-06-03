import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindMyApplicationsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'List my applications', description: 'Retrieve applications for the authenticated applicant.' }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiQuery({ name: 'status', required: false, type: [String] }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' }),
    ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
    ApiQuery({ name: 'populate', required: false, type: Boolean, example: true }),
    ApiResponse({ status: 200, description: 'My applications list', schema: { example: { data: [], meta: { total: 0, page: 1, limit: 10, pages: 0 } } } }),
  );
}


