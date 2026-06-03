import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindAllBlogPostsApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'List blog posts', description: 'Retrieve paginated blog posts with filters and sorting.' }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiQuery({ name: 'category', required: false, type: String, enum: ['scholarships','admissions','study_tips','career_advice','news','events','other'] }),
    ApiQuery({ name: 'tag', required: false, type: String }),
    ApiQuery({ name: 'featured', required: false, type: Boolean }),
    ApiQuery({ name: 'published', required: false, type: Boolean }),
    ApiQuery({ name: 'author_id', required: false, type: String }),
    ApiQuery({ name: 'slug', required: false, type: String }),
    ApiQuery({ name: 'published_after', required: false, type: String, description: 'ISO date' }),
    ApiQuery({ name: 'published_before', required: false, type: String, description: 'ISO date' }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String, example: 'published_at' }),
    ApiQuery({ name: 'sortOrder', required: false, type: String, example: 'desc' }),
    ApiResponse({
      status: 200,
      description: 'Paginated posts',
      schema: { example: { data: [{ _id: '6512...', title: 'How to Win Scholarships in 2025' }], meta: { total: 1, page: 1, limit: 10, pages: 1 } } },
    }),
  );
}


