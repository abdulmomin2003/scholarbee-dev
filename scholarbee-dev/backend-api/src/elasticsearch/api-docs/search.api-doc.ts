import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';

export function SearchApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Search index', description: 'Run a search query against the specified index.' }),
    ApiParam({ name: 'index', required: true, type: String }),
    ApiBody({
      description: 'Elasticsearch query DSL',
      schema: { example: { query: { match: { title: 'Document' } } } },
    }),
    ApiResponse({ status: 201, description: 'Search results', schema: { example: { hits: { total: 1, hits: [{ _id: '1', _source: { title: 'Document' } }] } } } }),
  );
}


