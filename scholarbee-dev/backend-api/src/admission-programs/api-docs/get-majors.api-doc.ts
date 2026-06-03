import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function getMajorsAdmissionProgramApiDocs() {

    return applyDecorators(
        ApiOperation({
            summary: 'Get all available majors',
            description: 'Deprecated. Use GET /program-templates/lookup/fields-of-study instead. ' +
                'Pass university_id or campus_id query params to scope results to admission-available templates.',
            deprecated: true,
        }),
        ApiQuery({
            name: 'university_id',
            required: false,
            type: String,
            description: 'Filter majors by university'
        }),
        ApiQuery({
            name: 'campus_id',
            required: false,
            type: String,
            description: 'Filter majors by campus'
        }),
        ApiResponse({
            status: 200,
            description: 'List of majors retrieved successfully',
            schema: {
                example: {
                    data: [
                        'Computer Science',
                        'Electrical Engineering',
                        'Business Administration',
                        'Medicine'
                    ],
                    total: 50,
                    hasMore: true
                }
            }
        }),
    );
}