import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { RemoveRequiredDocumentDto } from '../dto/update-student-scholarship.dto';

export function RemoveRequiredDocumentApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Remove required document', description: 'Remove a required document from a student scholarship.' }),
        ApiParam({ name: 'studentScholarshipId', description: 'Student scholarship id' }),
        ApiBody({
            type: RemoveRequiredDocumentDto,
            description: 'Document to remove',
            examples: {
                'Remove Document': {
                    value: {
                        "document_name": "academic_transcripts"
                    }
                },
                'Remove Recommendation': {
                    value: {
                        "document_name": "recommendation_letter"
                    }
                }
            }
        }),
        ApiResponse({ status: 200, description: 'Document removed', schema: { example: { _id: '617f1f77bcf86cd7994390aa', required_documents: [{ id: 'doc1', document_name: 'Transcript' }] } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required or insufficient permissions' }),
    );
}
