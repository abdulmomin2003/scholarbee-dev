import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiBody } from '@nestjs/swagger';
import { UpdateStudentScholarshipDto } from '../dto/update-student-scholarship.dto';

export function UpdateStudentScholarshipApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Update student scholarship', description: 'Update a student scholarship (admin or owner).' }),
        ApiBody({
            type: UpdateStudentScholarshipDto,
            description: 'Fields to update',
            examples: {
                'Update Application': {
                    value: {
                        "student_snapshot": {
                            "last_degree": {
                                "percentage": 92.5,
                                "level": "Intermediate"
                            },
                            "monthly_household_income": "100k-150k"
                        },
                        "personal_statement": "Updated personal statement with new achievements",
                        "required_documents": [
                            {
                                "document_name": "updated_transcripts",
                                "document_link": "www.example.com/transcripts"
                            },
                            {
                                "document_name": "income_certificate",
                                "document_link": "www.example.com/income"
                            }
                        ],
                        "reference_1": "Dr. Smith",
                        "reference_2": "Prof. Johnson"
                    }
                }
            }
        }),
        ApiResponse({ status: 200, description: 'Student scholarship updated', schema: { example: { _id: '617f1f77bcf86cd7994390aa', status: 'approved' } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required or insufficient permissions' }),
    );
}
