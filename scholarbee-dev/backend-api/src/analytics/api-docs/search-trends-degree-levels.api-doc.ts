import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function SearchTrendsMostSearchedDegreeLevelsApiDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Most searched degree levels', description: 'Returns the most searched degree levels. Currently not implemented.' }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of items to return' }),
    ApiResponse({ status: 501, description: 'Not implemented' }),
  );
}


