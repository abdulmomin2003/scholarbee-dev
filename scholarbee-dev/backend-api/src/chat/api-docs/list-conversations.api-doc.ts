import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function ListConversationsForUserApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'List conversations for current user' }),
    ApiQuery({ name: 'read_status', required: false, type: String, enum: ['read', 'unread'] }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String }),
    ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
    ApiResponse({ status: 200, description: 'Paginated conversations', schema: { example: { data: [{ _id: '6512conv...', name: 'Admissions Q&A' }], meta: { total: 1, page: 1, limit: 10, pages: 1 } } } }),
  );
}

export function GetConversationsCountForUserApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Conversations count for current user' }),
    ApiQuery({ name: 'read_status', required: false, type: String, enum: ['read', 'unread'] }),
    ApiResponse({ status: 200, description: 'Count result', schema: { example: { count: 5 } } }),
  );
}

export function ListConversationsForCampusApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'List conversations for campus (admin only)' }),
    ApiQuery({ name: 'read_status', required: false, type: String, enum: ['read', 'unread'] }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String }),
    ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
    ApiResponse({ status: 200, description: 'Paginated campus conversations', schema: { example: { data: [], meta: { total: 0, page: 1, limit: 10, pages: 0 } } } }),
  );
}

export function GetConversationsCountForCampusApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Conversations count for campus (admin only)' }),
    ApiQuery({ name: 'read_status', required: false, type: String, enum: ['read', 'unread'] }),
    ApiResponse({ status: 200, description: 'Count result', schema: { example: { count: 12 } } }),
  );
}


