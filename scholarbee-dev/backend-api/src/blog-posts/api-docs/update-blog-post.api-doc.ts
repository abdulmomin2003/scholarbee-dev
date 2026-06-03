import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateBlogPostDto } from '../dto/update-blog-post.dto';

export function UpdateBlogPostApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update blog post', description: 'Update an existing blog post. Requires admin authentication.' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiBody({
      type: UpdateBlogPostDto,
      examples: {
        default: {
          value: {
            title: 'Updated title',
            featured: false,
            published: true,
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Updated blog post', schema: { example: { _id: '651234abcd5678ef9012beef', title: 'Updated title' } } }),
  );
}


