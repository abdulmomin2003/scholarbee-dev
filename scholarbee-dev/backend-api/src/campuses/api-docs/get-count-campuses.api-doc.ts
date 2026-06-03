import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetCampusesCountApiDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get total campus count',
            description: 'Returns the total number of campuses in the database (excluding test entities).'
        }),
        ApiResponse({
            status: 200,
            description: 'Total count of campuses',
            schema: {
                example: {
                    total_campuses_count: 200
                }
            }
        }),
    );
}

