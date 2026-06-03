import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function FindCampusesByUniversityApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Find campuses by university ID' }),
    ApiParam({ name: 'universityId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Campuses for the university', schema: { example: [{ _id: '651234abcd5678ef9012c001', name: 'Main Campus' }] } }),
  );
}


