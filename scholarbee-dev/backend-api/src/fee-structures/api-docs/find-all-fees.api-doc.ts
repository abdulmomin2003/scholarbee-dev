import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindAllFeesApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'List fee structures' }),
    ApiQuery({ name: 'program_id', required: false, type: String }),
    ApiQuery({ name: 'minTuitionFee', required: false, type: Number }),
    ApiQuery({ name: 'maxTuitionFee', required: false, type: Number }),
    ApiQuery({ name: 'minApplicationFee', required: false, type: Number }),
    ApiQuery({ name: 'maxApplicationFee', required: false, type: Number }),
    ApiQuery({ name: 'currency', required: false, type: String }),
    ApiQuery({ name: 'payment_schedule', required: false, type: String }),
    ApiQuery({ name: 'createdAtFrom', required: false, type: String, description: 'ISO date' }),
    ApiQuery({ name: 'createdAtTo', required: false, type: String, description: 'ISO date' }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' }),
    ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiResponse({ status: 200, description: 'Paginated fees', schema: { example: { data: [{ _id: '6512fee01', program_id: '6512p001' }], meta: { total: 1, page: 1, limit: 10, pages: 1 } } } }),
  );
}


