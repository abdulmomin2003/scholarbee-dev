import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiBody } from '@nestjs/swagger';
import { UpdateStudentScholarshipApprovalStatusDto } from '../dto/update-student-scholarship.dto';

export function UpdateStudentScholarshipApprovalApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Update approval status', description: 'Update approval status of a student scholarship.' }),
        ApiBody({
            type: UpdateStudentScholarshipApprovalStatusDto,
            description: 'Approval payload',
            examples: {
                'Basic Program': {
                    value: {
                        "approval_status": "Approved"
                    }
                }
            }
        }),
        ApiResponse({ status: 200, description: 'Approval status updated', schema: { example: { _id: '617f1f77bcf86cd7994390aa', status: 'approved' } } }),
        ApiUnauthorizedResponse({ description: 'Authentication required or insufficient permissions' }),
    );
}
