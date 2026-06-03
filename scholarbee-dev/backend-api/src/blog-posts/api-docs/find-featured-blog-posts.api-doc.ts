import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindFeaturedBlogPostsApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Featured blog posts' }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String, example: 'published_at' }),
    ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
    ApiResponse({ status: 200, description: 'Featured posts', schema: { example: { data: [], meta: { total: 0, page: 1, limit: 10, pages: 0 } } } }),
  );
}


