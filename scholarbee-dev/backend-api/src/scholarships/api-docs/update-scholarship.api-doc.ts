import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse, ApiBody } from '@nestjs/swagger';
import { CreateScholarshipDto } from '../dto/create-scholarship.dto';

export function UpdateScholarshipApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Update scholarship', description: 'Admin can partially update a scholarship.' }),
        ApiParam({ name: 'id', required: true, description: 'Scholarship ID' }),
        ApiBody({
            type: CreateScholarshipDto,
            description: 'Partial scholarship fields',
            examples: {
                updatedScholarship: {
                    summary: 'Updated scholarship example',
                    value: {
                        scholarship_name: 'Updated Merit Scholarship 2025',
                        amount: 6000,
                        status: 'closed'
                    }
                }
            }
        }),
        ApiResponse({ status: 200, description: 'Updated scholarship', schema: { example: { _id: '617f1f77bcf86cd799439099', scholarship_name: 'Updated Scholarship', amount: 1500 } } }),
        ApiResponse({ status: 403, description: 'Forbidden resource' }),
        ApiUnauthorizedResponse({ description: 'Authentication required or insufficient permissions' }),
    );
}
