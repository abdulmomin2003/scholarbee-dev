import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetAdmissionProgramsCountApiDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get total admission program count',
            description: 'Returns the total number of admission programs in the database.'
        }),
        ApiResponse({
            status: 200,
            description: 'Total count of admission programs',
            schema: {
                example: {
                    total_admission_programs_count: 200
                }
            }
        }),
    );
}

