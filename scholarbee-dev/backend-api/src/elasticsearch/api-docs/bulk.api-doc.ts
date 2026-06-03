import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

export function BulkApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Bulk operations', description: 'Perform bulk operations (index/update/delete).' }),
    ApiBody({
      description: 'Array of bulk operations per Elasticsearch bulk API format',
      schema: {
        example: [
          { index: { _index: 'my-index', _id: '1' } },
          { title: 'Doc 1' },
          { update: { _index: 'my-index', _id: '2' } },
          { doc: { title: 'Updated' } },
          { delete: { _index: 'my-index', _id: '3' } },
        ],
      },
    }),
    ApiResponse({ status: 200, description: 'Bulk result', schema: { example: { success: true } } }),
  );
}


