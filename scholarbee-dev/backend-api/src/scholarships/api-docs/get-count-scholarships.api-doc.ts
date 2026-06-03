import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetScholarshipsCountApiDoc() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get total scholarship count',
            description: 'Returns the total number of scholarships in the database.'
        }),
        ApiResponse({
            status: 200,
            description: 'Total count of scholarships',
            schema: {
                example: {
                    total_scholarships_count: 200
                }
            }
        }),
    );
}

