import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function DeleteWebhookApiDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete file via webhook',
      description: 'Permanently delete a file from the GCS bucket by its file key via webhook (from PayloadCMS). This action cannot be undone. Requires webhook authentication (x-webhook-secret header).'
    }),
    ApiQuery({
      name: 'fileKey',
      required: true,
      type: String,
      description: 'File key/path to delete (e.g., profile-123-1718192000000.jpg or campus-logo-1718192000000.png)'
    }),
    ApiResponse({
      status: 200,
      description: 'File deleted successfully',
      schema: {
        example: {
          status: 'success',
          message: 'File deleted successfully',
          data: {
            fileKey: 'profile-123-1718192000000.jpg'
          }
        }
      }
    }),
    ApiNotFoundResponse({ description: 'File does not exist' }),
    ApiBadRequestResponse({ description: 'Invalid request or missing fileKey parameter' }),
    ApiUnauthorizedResponse({ description: 'Invalid webhook authentication' }),
  );
}
