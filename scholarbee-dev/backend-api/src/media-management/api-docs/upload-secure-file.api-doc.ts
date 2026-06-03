import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiConflictResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function UploadSecureFileApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({
            summary: 'Upload private/secure asset',
            description: 'Upload a file and keep it private. File will remain private and requires signed URLs for access. The response includes a signed URL that expires in 7 days. Use this endpoint for user profile pictures, sensitive documents, or any assets that should not be publicly accessible. Maximum file size: 2MB. Requires authentication. After the signed URL expires, use GET /media-management/:fileKey to generate a new signed URL.'
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
            description: 'Private file uploaded successfully',
            schema: {
                example: {
                    status: 'success',
                    message: 'Private file uploaded successfully',
                    data: {
                        fileKey: 'profile-123-1718192000000.jpg',
                        fileUploadUrl: 'https://storage.googleapis.com/scholarbee-backend-assets/profile-123-1718192000000.jpg?GoogleAccessId=...&Expires=1766997548&Signature=...',
                        isSecure: true,
                        size: 48699,
                        bucket: 'scholarbee-backend-assets',
                        etag: '"abc123def456"'
                    }
                }
            }
        }),
        ApiBadRequestResponse({ description: 'Invalid file or file too large (max 2MB)' }),
        ApiConflictResponse({ description: 'File already exists' }),
        ApiUnauthorizedResponse({ description: 'Authentication required' }),
    );
}

