import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function GetCampusPicturesApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get campus pictures' }),
    ApiParam({ name: 'id', required: true, type: String }),
    ApiResponse({ status: 200, description: 'List of picture URLs', schema: { example: ['https://cdn.example.com/pic1.jpg'] } }),
  );
}


