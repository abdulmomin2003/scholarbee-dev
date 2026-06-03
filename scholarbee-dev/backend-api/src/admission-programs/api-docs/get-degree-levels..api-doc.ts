import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function getDegreeLevelsAdmissionProgramApiDocs() {

    return applyDecorators(
        ApiOperation({
            summary: 'Fetch all degree levels',
            description: 'Returns a list of all available degree levels with optional filtering by university and campus'
        }),
        ApiQuery({
            name: 'university_id',
            required: false,
            type: String,
            description: 'Filter degree levels by university'
        }),
        ApiQuery({
            name: 'campus_id',
            required: false,
            type: String,
            description: 'Filter degree levels by campus'
        }),
        ApiResponse({
            status: 200,
            description: 'List of degree levels retrieved successfully',
            schema: {
                example: {
                    data: [
                        'BACHELORS',
                        'MASTERS',
                        'DOCTORATE',
                        'DIPLOMA'
                    ],
                    total: 4,
                }
            }
        }),
    );
}