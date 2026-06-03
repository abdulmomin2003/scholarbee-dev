import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetProgramsCountApiDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get total program count',
            description: 'Returns the total number of programs in the database (excluding soft-deleted programs).'
        }),
        ApiResponse({
            status: 200,
            description: 'Total count of programs',
            schema: {
                example: {
                    total_programs_count: 200
                }
            }
        }),
    );
}

