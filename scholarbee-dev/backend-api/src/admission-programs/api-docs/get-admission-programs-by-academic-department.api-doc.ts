import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

/**
 * API documentation decorator for getting related admission programs by academic department
 * 
 * This endpoint retrieves all programs belonging to a specific academic department,
 * then finds all admission programs for those programs that have valid (non-expired) deadlines.
 * 
 * The response includes:
 * - program_name: The name of the program (repeated for each admission program)
 * - admission_program_id: A single admission program ID that has a valid deadline
 * 
 * Note: If a program has multiple admission programs with valid deadlines, the program name
 * will appear multiple times in the response, once for each admission program ID.
 */
export function GetAdmissionProgramsByAcademicDepartmentApiDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get admission programs by academic department',
      description:
        'Retrieves all programs for a given academic department and returns their related admission programs with valid (non-expired) admission deadlines. Only admission programs where the deadline is null, undefined, or greater than the current date are included. Each admission program is returned as a separate document with the program name repeated.',
    }),
    ApiQuery({
      name: 'academic_department_id',
      required: true,
      type: String,
      description: 'The MongoDB ObjectId of the academic department',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      status: 200,
      description: 'List of admission programs with their associated program names. Each admission program is a separate entry.',
      schema: {
        example: [
          {
            program_name: 'Computer Science',
            admission_program_id: '507f1f77bcf86cd799439012',
          },
          {
            program_name: 'Computer Science',
            admission_program_id: '507f1f77bcf86cd799439013',
          },
          {
            program_name: 'Electrical Engineering',
            admission_program_id: '507f1f77bcf86cd799439014',
          },
        ],
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid academic department ID format',
    }),
  );
}

