import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetBlogPostsStatisticsApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Blog posts statistics' }),
    ApiResponse({ status: 200, description: 'Aggregated stats', schema: { example: { total: 120, published: 100, featured: 20 } } }),
  );
}


