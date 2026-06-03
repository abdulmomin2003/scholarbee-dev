import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiBody } from '@nestjs/swagger';
import { UpdateAdmissionProgramDto } from '../dto/update-admission-program.dto';

export function updateAdmissionProgramApiDocs() {

    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Update an existing admission program',
            description: 'Updates an admission program with the provided partial data. All fields are optional.'
        }),
        ApiParam({
            name: 'id',
            description: 'Admission program ID (MongoDB ObjectId)',
            type: String,
            required: true
        }),
        ApiBody({
            type: UpdateAdmissionProgramDto,
            description: 'Fields to update',
            examples: {
                'Update Seats': {
                    value: {
                        available_seats: 75,
                        admission_fee: '60000'
                    }
                },
                'Update Requirements': {
                    value: {
                        admission_requirements: [
                            {
                                id: 'req1',
                                key: 'Updated Requirements',
                                value: [{
                                    type: 'paragraph',
                                    children: [{ text: 'New requirements text', bold: true }]
                                }]
                            }
                        ]
                    }
                }
            }
        }),
        ApiResponse({
            status: 200,
            description: 'Admission program updated successfully',
            schema: {
                example: {
                    id: '507f1f77bcf86cd799439011',
                    admission: {
                        id: '507f1f77bcf86cd799439012',
                        name: 'Fall 2024 Admission'
                    },
                    program: {
                        id: '507f1f77bcf86cd799439013',
                        name: 'Computer Science'
                    },
                    admission_fee: '60000',
                    available_seats: 75,
                    admission_requirements: [
                        {
                            id: 'req1',
                            key: 'Updated Requirements',
                            value: [{
                                type: 'paragraph',
                                children: [{ text: 'New requirements text', bold: true }]
                            }]
                        }
                    ]
                }
            }
        }),
        ApiUnauthorizedResponse({
            description: 'Unauthorized - Invalid or missing authentication token'
        }),
        ApiForbiddenResponse({
            description: 'Forbidden - User does not have permission to update this admission program'
        }),
        ApiNotFoundResponse({
            description: 'Not Found - Admission program with the specified ID does not exist'
        }),
    );
}