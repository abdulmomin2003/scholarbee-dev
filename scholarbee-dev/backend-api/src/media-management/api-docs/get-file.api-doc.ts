import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export function GetFileApiDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get file metadata and signed URL',
      description: 'Retrieve file metadata and generate a signed URL for private assets. Use this endpoint for files uploaded via /secure endpoint. Public assets already have URLs from upload response, so this is not needed for them. The signed URL expires after the specified duration (default: 7 days).'
    }),
    ApiParam({
      name: 'fileKey',
      required: true,
      type: String,
      description: 'File key/path stored in database (e.g., profile-123-1718192000000.jpg)'
    }),
    ApiQuery({
      name: 'expiry_in_hours',
      required: false,
      type: Number,
      example: 168,
      description: 'Expiration time for signed URL in hours (default: 168 = 7 days)'
    }),
    ApiResponse({
      status: 200,
      description: 'File information with signed URL',
      schema: {
        example: {
          key: 'profile-123-1718192000000.jpg',
          size: 48699,
          lastModified: '2025-01-20T10:30:00.000Z',
          contentType: 'image/jpeg',
          downloadUrl: 'https://storage.googleapis.com/scholarbee-backend-assets/profile-123-1718192000000.jpg?GoogleAccessId=...&Expires=1766997548&Signature=...',
          expiresInHours: 168
        }
      }
    }),
    ApiNotFoundResponse({ description: 'File not found' }),
  );
}

