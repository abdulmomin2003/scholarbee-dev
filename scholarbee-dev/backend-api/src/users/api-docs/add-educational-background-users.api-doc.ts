import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiBody, ApiParam } from '@nestjs/swagger';

export function AddEducationalBackgroundUsersApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Add educational background', description: 'Attach an educational background record to the given user.' }),
        ApiParam({ name: 'userId', required: true, description: 'User ID' }),
        ApiBody({
            description: 'Educational background payload',
            schema: {
                example: {
                    education_level: 'Matriculation',
                    school_college_university: 'University of Example',
                    field_of_study: 'Computer Science',
                    board: 'Matriculation',
                    marks_gpa: { total_marks_gpa: '4.00', obtained_marks_gpa: '3.50' },
                    year_of_passing: '2020',
                    transcript: 'https://cdn.example.com/transcripts/abc.pdf'
                }
            }
        }),
        ApiResponse({ status: 201, description: 'Educational background created', schema: { example: { _id: '617f1f77bcf86cd799439099', education_level: 'Bachelor', field_of_study: 'Computer Science', marks_gpa: { total_marks_gpa: '4.00', obtained_marks_gpa: '3.50' } } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required' }),
    );
}
