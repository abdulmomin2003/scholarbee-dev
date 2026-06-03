import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindAllContactsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'List contact requests (admin)' }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiQuery({ name: 'email', required: false, type: String }),
    ApiQuery({ name: 'phone', required: false, type: String }),
    ApiQuery({ name: 'type', required: false, type: String, enum: ['registration', 'general'] }),
    ApiQuery({ name: 'is_scholarship', required: false, type: Boolean }),
    ApiQuery({ name: 'study_level', required: false, type: String }),
    ApiQuery({ name: 'study_country', required: false, type: String }),
    ApiQuery({ name: 'study_city', required: false, type: String }),
    ApiQuery({ name: 'campusesIds', required: false, type: [String] }),
    ApiQuery({ name: 'user_type', required: false, type: String, enum: ['Student', 'Admin'] }),
    ApiQuery({ name: 'createdAtFrom', required: false, type: String, description: 'ISO date' }),
    ApiQuery({ name: 'createdAtTo', required: false, type: String, description: 'ISO date' }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' }),
    ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
    ApiQuery({ name: 'populate', required: false, type: Boolean, example: true }),
    ApiResponse({ status: 200, description: 'Paginated contacts', schema: { example: { data: [{ _id: '6512...', name: 'Ali Khan' }], meta: { total: 1, page: 1, limit: 10, pages: 1 } } } }),
  );
}


