import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindAllExternalApplicationsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'List external applications' }),
    ApiQuery({ name: 'time_range', required: false, type: String, enum: ['weekly', 'monthly'] }),
    ApiQuery({ name: 'programId', required: false, type: String }),
    ApiQuery({ name: 'universityId', required: false, type: String }),
    ApiQuery({ name: 'campusId', required: false, type: String }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String }),
    ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
    ApiResponse({ status: 200, description: 'Paginated list', schema: { example: { data: [{ _id: '6512ea01', program: '6512p001' }], meta: { total: 1, page: 1, limit: 10, pages: 1 } } } }),
  );
}


