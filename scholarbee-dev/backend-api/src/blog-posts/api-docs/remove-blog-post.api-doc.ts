import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function RemoveBlogPostApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete blog post', description: 'Delete a blog post by ID. Requires admin authentication.' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Deleted blog post', schema: { example: { _id: '651234abcd5678ef9012beef', deleted: true } } }),
  );
}


