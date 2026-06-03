import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CreateAdmissionProgramDto } from '../dto/create-admission-program.dto';

export function CreateAdmissionProgramApiDocs() {

    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Create a new admission program',
            description: 'Creates a new admission program with the specified details. Requires authentication and proper permissions.'
        }),
        ApiBody({
            type: CreateAdmissionProgramDto,
            description: 'Admission program details',
            examples: {
                'Basic Program': {
                    value: {
                        admission: '507f1f77bcf86cd799439011',
                        program: '507f1f77bcf86cd799439012',
                        admission_fee: '50000',
                        available_seats: 100,
                        redirect_deeplink: 'https://example.com/apply',
                        admission_requirements: [
                            {
                                id: 'req1',
                                key: 'Academic Requirements',
                                value: [{
                                    type: 'paragraph',
                                    children: [
                                        {
                                            text: 'Minimum GPA 3.0',
                                            type: 'text',
                                            bold: true
                                        }
                                    ]
                                }]
                            }
                        ]
                    }
                }
            }
        }),
        ApiResponse({
            status: 201,
            description: 'Admission program created successfully',
        }),
        ApiUnauthorizedResponse({
            description: 'Unauthorized - Invalid or missing authentication token'
        }),
        ApiForbiddenResponse({
            description: 'Forbidden - User does not have permission to create admission programs'
        }),
        ApiResponse({
            status: 400,
            description: 'Bad Request - Invalid input data',
            schema: {
                example: {
                    statusCode: 400,
                    message: ['admission must be a valid MongoDB ObjectId', 'available_seats must be a number'],
                    error: 'Bad Request'
                }
            }
        })
    );
}