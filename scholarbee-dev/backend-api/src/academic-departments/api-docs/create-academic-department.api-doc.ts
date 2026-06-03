import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CreateAcademicDepartmentDto } from '../dto/create-academic-department.dto';

export function CreateAcademicDepartmentApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Create academic department',
            description: 'Create a new academic department. Requires authentication.',
        }),
        ApiBody({
            type: CreateAcademicDepartmentDto,
            description: 'Academic department payload',
            examples: {
                default: {
                    value: {
                        name: 'Computer Science',
                        campus_id: '64f1a2b3c4d5e6f7890a1234',
                        contact_phone: '+1-555-123-4567',
                        contact_email: 'cs-dept@example.edu',
                        head_of_department: 'Dr. Ada Lovelace',
                    },
                },
            },
        }),
        ApiResponse({
            status: 201,
            description: 'Department created successfully',
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


