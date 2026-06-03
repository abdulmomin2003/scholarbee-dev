import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiBody } from '@nestjs/swagger';
import { CreateAdmissionDto } from '../dto/create-admission.dto';

export function CreateAdmissionApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Create admission', description: 'Create a new admission posting (authenticated users).' }),
        ApiBody({
            type: CreateAdmissionDto,
            description: 'Admission payload',
            examples: {
                'Standard Admission': {
                    value: {
                        "admission_announcements": [
                            { "id": "ann1", "key": "interview_date", "value": "2025-05-01" },
                            { "id": "ann2", "key": "venue", "value": "Main Campus Hall" }
                        ],
                        "admission_deadline": "2025-06-30T00:00:00.000Z",
                        "admission_description": "Undergraduate admission for Fall 2025",
                        "admission_startdate": "2025-08-01T00:00:00.000Z",
                        "admission_title": "BSc Computer Science Fall 2025",
                        "available_seats": 120,
                        "campus_id": "6503cbea5652e43948728a3a",
                        "poster": "https://example.com/poster.jpg",
                        "university_id": "6403cbea5652e43948728a1a"
                    }
                }
            }
        }),
        ApiResponse({ status: 201, description: 'Admission created', schema: { example: { _id: '617f1f77bcf86cd7994390ab', admission_title: 'BSc Computer Science Fall 2025' } } }),
        ApiResponse({ status: 403, description: 'Forbidden' }),
        ApiUnauthorizedResponse({ description: 'Authentication required or insufficient permissions' }),
    );
}
