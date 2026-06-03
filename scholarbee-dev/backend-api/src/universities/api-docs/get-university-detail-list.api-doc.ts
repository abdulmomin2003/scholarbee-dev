import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetUniversityDetailListApiDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get university profile details by filter parameters',
      description:
        'Fetches a single university profile using a unique combination of university name and city. Returns an array with at most one element containing metadata, overview, and campus information.',
    }),
    ApiResponse({
      status: 200,
      description: 'University profile found. Returns array with single element.',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            metadata: {
              type: 'object',
              properties: {
                university_logo: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                country: { type: 'string' },
                established_date: { type: 'string', format: 'date' },
                accreditation: { type: 'array', items: { type: 'string' } },
                ranking: { type: 'object' },
                total_campuses: { type: 'number' },
              },
            },
            overview: {
              type: 'object',
              properties: {
                description: { type: 'string' },
              },
            },
            selectedCampus: { type: 'object' },
            otherCampuses: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'No university found matching the filters',
    }),
  );
}
