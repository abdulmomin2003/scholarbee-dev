import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function GetFilesApiDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'List uploaded files',
      description: 'Retrieve a list of files stored in the GCS bucket. Returns file metadata including key, size, and last modified date.'
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 10,
      description: 'Maximum number of files to return (default: 10)'
    }),
    ApiResponse({
      status: 200,
      description: 'List of uploaded files',
      schema: {
        example: {
          files: [
            {
              key: 'campus-logo-1718192000000.png',
              lastModified: '2025-01-20T10:30:00.000Z',
              size: 48699
            },
            {
              key: 'profile-123-1718192000000.jpg',
              lastModified: '2025-01-20T09:15:00.000Z',
              size: 125430
            }
          ]
        }
      }
    }),
  );
}

