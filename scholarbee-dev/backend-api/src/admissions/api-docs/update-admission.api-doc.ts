import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { UpdateAdmissionDto } from '../dto/update-admission.dto';

export function UpdateAdmissionApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Update admission', description: 'Update an admission posting (authenticated users).' }),
        ApiParam({ name: 'id', description: 'Admission id' }),
        ApiBody({
            type: UpdateAdmissionDto,
            description: 'Fields to update',
            examples: {
                'Update Seats and Poster': {
                    value: {
                        "available_seats": 100,
                        "poster": "https://example.com/new-poster.jpg"
                    }
                },
                'Extend Deadline': {
                    value: {
                        "admission_deadline": "2025-07-31T00:00:00.000Z"
                    }
                }
            }
        }),
        ApiResponse({ status: 200, description: 'Admission updated', schema: { example: { _id: '617f1f77bcf86cd7994390ab', admission_title: 'BSc Computer Science Fall 2025' } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required or insufficient permissions' }),
    );
}
