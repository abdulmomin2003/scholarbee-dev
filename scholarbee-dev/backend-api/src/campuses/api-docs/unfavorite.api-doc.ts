import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function UnfavoriteCampusApiDocs() {

  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Remove a campus from user favorites',
      description: 'Removes the specified campus from the authenticated user\'s favorites list'
    }),
    ApiParam({
      name: 'campus_id',
      description: 'Campus ID (MongoDB ObjectId)',
      type: String,
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Campus removed from favorites successfully',
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
      description: 'Not Found - Campus with the specified ID does not exist',
    })
  );
}

