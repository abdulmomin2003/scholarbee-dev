import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function RemoveAcademicDepartmentApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Delete academic department', description: 'Delete an academic department by ID. Requires authentication.' }),
        ApiParam({ name: 'id', required: true, type: String, description: 'Department ID' }),
        ApiResponse({
            status: 200,
            description: 'Deletion result',
            schema: {
                example: {
                    _id: '651234abcd5678ef9012cdef',
                    name: 'Computer Science',
                    campus_id: '64f1a2b3c4d5e6f7890a1234',
                    contact_phone: '+1-555-123-4567',
                    contact_email: 'cs-dept@example.edu',
                    head_of_department: 'Dr. Ada Lovelace',
                    createdBy: '6500aa11bb22cc33dd44ee55',
                    createdAt: '2025-01-01T12:00:00.000Z',
                    updatedAt: '2025-01-01T12:00:00.000Z',
                    __v: 0,
                },
            },
        }),
        ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
    );
}


