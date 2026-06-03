import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

export function GetAdmissionApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Get admission', description: 'Retrieve an admission posting by id.' }),
        ApiParam({ name: 'id', description: 'Admission id' }),
        ApiResponse({ status: 200, description: 'Admission', schema: { example: { _id: '617f1f77bcf86cd7994390ab', admission_title: 'BSc Computer Science Fall 2025', admission_deadline: '2025-06-30T00:00:00.000Z' } } }),
    );
}
