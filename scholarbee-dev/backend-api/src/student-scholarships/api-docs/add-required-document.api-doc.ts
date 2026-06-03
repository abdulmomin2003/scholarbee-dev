import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { AddRequiredDocumentDto } from '../dto/update-student-scholarship.dto';

export function AddRequiredDocumentApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Add required document', description: 'Add a required document to a student scholarship.' }),
        ApiParam({ name: 'studentScholarshipId', description: 'Student scholarship id' }),
        ApiBody({
            type: AddRequiredDocumentDto,
            description: 'Document to add',
            examples: {
                'Add Document': {
                    value: {
                        "document_name": "academic_transcripts",
                        "document_link": "www.example.com/transcripts"
                    }
                },
                'Add Recommendation': {
                    value: {
                        "document_name": "recommendation_letter",
                        "document_link": "www.example.com/recommendation"
                    }
                }
            }
        }),
        ApiResponse({ status: 200, description: 'Document added', schema: { example: { _id: '617f1f77bcf86cd7994390aa', required_documents: [{ id: 'doc1', document_name: 'Transcript' }, { id: 'doc3', document_name: 'Recommendation Letter' }] } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required or insufficient permissions' }),
    );
}
