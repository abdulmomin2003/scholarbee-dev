import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function UnfavoriteAdmissionProgramApiDocs() {

  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Remove an admission program from user favorites',
      description: 'Removes the specified admission program from the authenticated user\'s favorites list'
    }),
    ApiParam({
      name: 'adm_prg_id',
      description: 'Admission program ID (MongoDB ObjectId)',
      type: String,
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Admission program removed from favorites successfully',
      schema: {
        example: {
          id: '507f1f77bcf86cd799439011',
          message: 'Removed from favorites successfully'
        }
      }
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Invalid or missing authentication token',
    }),
    ApiNotFoundResponse({
      description: 'Not Found - Admission program with the specified ID does not exist',
    })
  );
}