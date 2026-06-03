import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiBody } from '@nestjs/swagger';
import { CreateStudentScholarshipDto } from '../dto/create-student-scholarship.dto';

export function CreateStudentScholarshipApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Create student scholarship', description: 'Create a new student scholarship (authenticated user).' }),
        ApiBody({
            type: CreateStudentScholarshipDto,
            description: 'Student scholarship payload',
            examples: {
                'Basic Program': {
                    value: {
                        "student_id": "687a1f42f1f72ed11187dbdf",
                        "reference_1": "afaq",
                        "reference_2": "hasnain",
                        "scholarship_id": "6803cbea5652e43948728a3a",
                        "student_snapshot": {
                            "last_degree": {
                                "percentage": 90.45,
                                "level": "Intermediate"
                            },
                            "monthly_household_income": "50k-100k"
                        },
                        "personal_statement": "personal_statement_required",
                        "required_documents": [
                            {
                                "document_name": "academic_transcripts",
                                "document_link": "www.google.com"
                            },
                            {
                                "document_name": "recommendation_letter",
                                "document_link": "www.google.com"
                            },
                            {
                                "document_name": "personal_statement",
                                "document_link": "www.google.com"
                            }
                        ]
                    }
                }
            }
        }),
        ApiResponse({ status: 201, description: 'Student scholarship created', schema: { example: { _id: '617f1f77bcf86cd7994390aa', scholarship_id: '617f1f77bcf86cd799439099', student_id: '507f1f77bcf86cd799439011', status: 'pending' } } }),
        ApiResponse({ status: 403, description: 'Forbidden resource' }),
        ApiResponse({ status: 409, description: 'You have already applied for this scholarship' }),
        ApiUnauthorizedResponse({ description: 'Authentication required or insufficient permissions' }),
    );
}
