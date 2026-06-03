import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateBlogPostDto } from '../dto/create-blog-post.dto';

export function CreateBlogPostApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create blog post', description: 'Create a new blog post. Requires admin authentication.' }),
    ApiBody({
      type: CreateBlogPostDto,
      examples: {
        default: {
          value: {
            title: 'How to Win Scholarships in 2025',
            markdown_content: '# Scholarships Guide\nHere are the tips... ',
            posted_by_name: 'Site Admin',
            posted_by_email: 'admin@example.com',
            category: 'scholarships',
            thumbnail: 'https://cdn.example.com/thumb.jpg',
            slug: 'win-scholarships-2025',
            excerpt: 'Key strategies to maximize your scholarship chances.',
            tags: ['scholarships', 'tips'],
            featured: true,
            published: true,
            published_at: '2025-01-05T12:00:00.000Z',
            author_id: '6500aa11bb22cc33dd44ee55',
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Blog post created', schema: { example: { _id: '651234abcd5678ef9012beef', title: 'How to Win Scholarships in 2025' } } }),
  );
}


