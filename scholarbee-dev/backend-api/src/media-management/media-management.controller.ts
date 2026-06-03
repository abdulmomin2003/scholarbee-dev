import { Controller, Delete, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { MediaManagementService } from 'src/media-management/media-management.service';
import { ResourceProtectionGuard } from 'src/auth/guards/resource-protection.guard';
import { WebhookAuthGuard } from 'src/auth/guards/webhook-auth.guard';
import { GetFilesApiDoc } from './api-docs/get-files.api-doc';
import { GetFileApiDoc } from './api-docs/get-file.api-doc';
import { UploadFileApiDoc } from './api-docs/upload-file.api-doc';
import { UploadSecureFileApiDoc } from './api-docs/upload-secure-file.api-doc';
import { UploadWebhookApiDoc } from './api-docs/upload-webhook.api-doc';
import { DeleteFileApiDoc } from './api-docs/delete-file.api-doc';
import { DeleteWebhookApiDoc } from './api-docs/delete-webhook.api-doc';

@ApiTags('media-management')
@Controller('media-management')
export class MediaManagementController {

    constructor(private readonly mediaManagementService: MediaManagementService) { }

    @GetFilesApiDoc()
    @Get('/')
    async getFiles(
        @Query('limit') limit?: number,
        // @Query('page') page?: number,
    ) {
        const res = await this.mediaManagementService.getFiles({
            limit: limit ? Number(limit) : undefined,
            // page: page ? Number(page) : 1,
        });
        return res;
    }

    /**
     * Get file metadata and signed URL (for private assets only)
     * 
     * Use this endpoint for files uploaded via /secure endpoint.
     * Public assets already have URLs from upload response, so this is not needed for them.
     * The signed URL expires after the specified duration (default: 7 days).
     * 
     * @param fileKey - File key from database (for private assets)
     * @param expiry_in_hours - Expiration time for signed URL in hours (default: 168 = 7 days)
     */
    @GetFileApiDoc()
    @Get('/:fileKey')
    async getFile(
        @Param('fileKey') fileKey: string,
        @Query('expiry_in_hours') expiry_in_hours?: number,
    ) {
        const expirationHours = expiry_in_hours ? Number(expiry_in_hours) : 7 * 24; // Default 7 days
        const res = await this.mediaManagementService.getFile(fileKey, expirationHours);
        return res;
    }

    /**
     * Upload public asset (default behavior)
     * File will be made public and accessible via direct URL
     * Returns: { fileKey, url, size, ... }
     * Use for: campus logos, university logos, scholarship images, organization logos, etc.
     */
    @UploadFileApiDoc()
    @Post('/')
    @UseGuards(ResourceProtectionGuard) // Protect upload endpoint - only authenticated users can upload
    @UseInterceptors(FileInterceptor('file')) // Extracts file from multipart/form-data request
    async uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 2000_000 }), // 2mb
                    // new FileTypeValidator({ fileType: 'image/jpeg,image/png,image/jpg' }),
                ],
            })
        ) file: Express.Multer.File,
    ) {
        // Default: isSecure = false, so file will be made public
        const res = await this.mediaManagementService.uploadFile(file, false);
        return {
            status: 'success',
            message: 'Public file uploaded successfully',
            data: res, // Contains fileKey and url
        };
    }

    /**
     * Upload private/secure asset
     * File will remain private and requires signed URLs for access
     * Returns: { fileKey, fileUploadUrl (signed URL), size, ... }
     * Use for: user profile pictures, sensitive documents, etc.
     * Note: The signed URL in the response expires in 7 days. Use GET /:fileKey to generate a new one when needed.
     */
    @UploadSecureFileApiDoc()
    @Post('/secure')
    @UseGuards(ResourceProtectionGuard) // Protect upload endpoint - only authenticated users can upload
    @UseInterceptors(FileInterceptor('file')) // Extracts file from multipart/form-data request
    async uploadSecureFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 2000_000 }), // 2mb
                    // new FileTypeValidator({ fileType: 'image/jpeg,image/png,image/jpg' }),
                ],
            })
        ) file: Express.Multer.File,
    ) {
        // isSecure = true, so file will remain private
        const res = await this.mediaManagementService.uploadFile(file, true);
        return {
            status: 'success',
            message: 'Private file uploaded successfully',
            data: res, // Contains fileKey and fileUploadUrl (signed URL, expires in 7 days)
        };
    }

    @DeleteFileApiDoc()
    @Delete('/')
    @UseGuards(ResourceProtectionGuard) // Protect delete endpoint - only authenticated users can delete
    async deleteFile(@Query('fileKey') fileKey: string) {
        const res = await this.mediaManagementService.deleteFile(fileKey);
        return {
            status: 'success',
            message: 'File deleted successfully',
            data: res,
        };
    }
}



// Media Management Webhook Controller
@ApiTags('webhooks/media-management')
@Controller('webhooks/media-management')
export class MediaManagementWebhookController {

    constructor(private readonly mediaManagementService: MediaManagementService) { }

    /**
     * Webhook endpoint for uploading files from PayloadCMS
     * File will be made public and accessible via direct URL
     * Returns: { fileKey, url, size, ... }
     * This endpoint is protected by webhook authentication (x-webhook-secret header)
     */
    @UploadWebhookApiDoc()
    @Post('/')
    @UseGuards(WebhookAuthGuard) // Protect with webhook authentication
    @UseInterceptors(FileInterceptor('file')) // Extracts file from multipart/form-data request
    async uploadFileWebhook(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 2000_000 }), // 2mb
                    // new FileTypeValidator({ fileType: 'image/jpeg,image/png,image/jpg' }),
                ],
            })
        ) file: Express.Multer.File,
    ) {
        // Default: isSecure = false, so file will be made public
        const res = await this.mediaManagementService.uploadFile(file, false);
        return {
            status: 'success',
            message: 'Public file uploaded successfully',
            data: res, // Contains fileKey and url
        };
    }

    /**
     * Webhook endpoint for deleting files from PayloadCMS
     * Permanently deletes a file from GCS bucket by fileKey
     * Returns: { fileKey, ... }
     * This endpoint is protected by webhook authentication (x-webhook-secret header)
     */
    @DeleteWebhookApiDoc()
    @Delete('/delete')
    @UseGuards(WebhookAuthGuard) // Protect with webhook authentication
    async deleteFileWebhook(@Query('fileKey') fileKey: string) {
        const res = await this.mediaManagementService.deleteFile(fileKey);
        return {
            status: 'success',
            message: 'File deleted successfully',
            data: res,
        };
    }
}