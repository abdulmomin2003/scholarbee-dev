import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

export function FindOneStudentScholarshipApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Get student scholarship', description: 'Retrieve a student scholarship by id.' }),
        ApiParam({ name: 'id', description: 'Student scholarship id' }),
        ApiResponse({ status: 200, description: 'Student scholarship', schema: { example: { _id: '617f1f77bcf86cd7994390aa', scholarship_id: '617f1f77bcf86cd799439099', student_id: '507f1f77bcf86cd799439011', status: 'pending' } } }),
    );
}
