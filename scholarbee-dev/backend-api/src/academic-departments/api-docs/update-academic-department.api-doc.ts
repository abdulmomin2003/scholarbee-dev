import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UpdateAcademicDepartmentDto } from '../dto/update-academic-department.dto';

export function UpdateAcademicDepartmentApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Update academic department', description: 'Update one or more fields of an academic department by ID. Requires authentication.' }),
        ApiParam({ name: 'id', required: true, type: String, description: 'Department ID' }),
        ApiBody({
            type: UpdateAcademicDepartmentDto,
            description: 'Fields to update',
            examples: {
                default: {
                    value: {
                        contact_email: 'updated-cs-dept@example.edu',
                        contact_phone: '+1-555-987-6543',
                        head_of_department: 'Dr. Grace Hopper',
                    },
                },
            },
        }),
        ApiResponse({
            status: 200,
            description: 'Updated department document',
            schema: {
                example: {
                    _id: '651234abcd5678ef9012cdef',
                    name: 'Computer Science',
                    campus_id: '64f1a2b3c4d5e6f7890a1234',
                    contact_phone: '+1-555-987-6543',
                    contact_email: 'updated-cs-dept@example.edu',
                    head_of_department: 'Dr. Grace Hopper',
                    createdBy: '6500aa11bb22cc33dd44ee55',
                    createdAt: '2025-01-01T12:00:00.000Z',
                    updatedAt: '2025-01-03T09:15:00.000Z',
                    __v: 0,
                },
            },
        }),
        ApiUnauthorizedResponse({ description: 'Missing or invalid authentication' }),
    );
}


