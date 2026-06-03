import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiConflictResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function UploadWebhookApiDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Upload public asset via webhook',
      description: 'Upload a file via webhook (from PayloadCMS) and make it publicly accessible. File will be made public and accessible via direct URL. Maximum file size: 2MB. Requires webhook authentication (x-webhook-secret header).'
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'File to upload (max 2MB). Supported formats: images, videos, PDFs.'
          }
        },
        required: ['file']
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Public file uploaded successfully',
      schema: {
        example: {
          status: 'success',
          message: 'Public file uploaded successfully',
          data: {
            fileKey: 'campus-logo-1718192000000.png',
            fileUploadUrl: 'https://storage.googleapis.com/scholarbee-backend-assets/campus-logo-1718192000000.png',
            isSecure: false,
            size: 48699,
            bucket: 'scholarbee-backend-assets',
            etag: '"abc123def456"'
          }
        }
      }
    }),
    ApiBadRequestResponse({ description: 'Invalid file or file too large (max 2MB)' }),
    ApiConflictResponse({ description: 'File already exists' }),
    ApiUnauthorizedResponse({ description: 'Invalid webhook authentication' }),
  );
}
