import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiBody } from '@nestjs/swagger';
import { CreateScholarshipDto } from '../dto/create-scholarship.dto';

export function CreateScholarshipApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Create scholarship', description: 'Create a new scholarship (admin only).' }),
        ApiBody({
            type: CreateScholarshipDto, description: 'Scholarship payload',
            examples: {
                'Basic Program': {
                    value: {
                        scholarship_name: 'Engineering Merit Scholarship',
                        scholarship_description: 'Scholarship for engineering students with excellent academic record',
                        scholarship_type: 'merit',
                        amount: 50000,
                        application_deadline: '2023-12-31T00:00:00.000Z',
                        application_link: 'https://example.com/apply',
                        application_process: 'Apply online through the portal',
                        eligibility_criteria: 'CGPA above 3.5, Engineering major',
                        required_documents: [
                            { id: 'doc1', document_name: 'Transcript' },
                            { id: 'doc2', document_name: 'ID Card' }
                        ],
                        university_id: 'university-id',
                        region: 'region-id',
                        image_url: 'https://example.com/scholarship.jpg',
                        organization_id: 'organization-id'
                    }
                }
            }
        }),
        ApiResponse({ status: 201, description: 'Scholarship created', schema: { example: { _id: '617f1f77bcf86cd799439099', scholarship_name: 'Merit Scholarship 2025', scholarship_type: 'merit', amount: 1000, university_id: '507f1f77bcf86cd799439011' } } }),
        ApiResponse({ status: 403, description: 'Forbidden resource' }),
        ApiUnauthorizedResponse({ description: 'Authentication required or insufficient permissions' }),
    );
}
