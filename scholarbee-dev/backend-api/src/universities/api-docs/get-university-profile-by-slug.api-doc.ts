import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function GetUniversityProfileBySlugApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get university profile by slug', description: 'Get detailed university profile with campuses and programs.' }),
    ApiParam({ name: 'slug', required: true, type: String }),
    ApiQuery({ name: 'selectedCampusId', required: false, type: String, description: 'Optional campus ID to highlight in the profile' }),
    ApiResponse({
      status: 200,
      description: 'University profile with detailed information',
      schema: {
        example: {
          university: { _id: '651234abcd5678ef9012u001', name: 'LUMS' },
          campuses: [{ _id: '6512c001', name: 'Main Campus' }],
          programs: [{ _id: '6512p001', name: 'BSc CS' }],
        },
      },
    }),
  );
}

