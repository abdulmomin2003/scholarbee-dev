import { Storage, ApiError as GoogleCloudStorageApiError } from '@google-cloud/storage';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfiguration } from 'src/config/configuration';
import { EnvValidationSchema } from 'src/config/validation/env.validation';

interface IPaginationOptions {
    limit?: number;
    // page?: number;
}

@Injectable()
export class MediaManagementService {
    private readonly bucketPath: string;
    private readonly bucketName: string;
    private readonly storage: Storage;

    constructor(
        private readonly configService: ConfigService<IConfiguration & EnvValidationSchema, true>
    ) {
        const gcsConfig = this.configService.get('gcs', { infer: true })!;

        this.bucketPath = gcsConfig.bucketPath;
        this.bucketName = gcsConfig.bucket;
        this.storage = new Storage({
            projectId: gcsConfig.projectId,
            // Use the credentials in case of service key account/ or servcice account imppersonation because asset signing is not allowed through ADC directly
            // credentials: {
            //     client_email: gcsConfig.clientEmail,
            //     private_key: gcsConfig.privateKey.replace(/\\n/g, '\n'),
            // },
        });
    }

    /**
     * Handles Google Cloud Storage errors and converts them to appropriate NestJS exceptions
     * @param error - The error caught from Google Cloud Storage operations
     * @param defaultMessage - Default error message if error doesn't have a message
     * @param context - Additional context for the error (e.g., fileKey for file operations)
     */
    private handleGoogleCloudStorageError(
        error: any,
        defaultMessage: string,
        context?: { fileKey?: string }
    ): never {
        // If it's already a NestJS exception, re-throw it
        if (
            error instanceof NotFoundException ||
            error instanceof ConflictException ||
            error instanceof BadRequestException ||
            error instanceof ForbiddenException
        ) {
            throw error;
        }

        // Try to parse error message as JSON, but handle cases where it's not valid JSON
        let parsedErrorWrapped: unknown = null;
        try {
            if (error.message) {
                parsedErrorWrapped = JSON.parse(error.message);
            }
        } catch {
            // If parsing fails, error.message might be a plain string
            // In that case, we'll handle it in the generic Error handling below
        }

        // Handle Google Cloud Storage API errors
        // Check if error is a GoogleCloudStorageApiError instance
        if (error instanceof GoogleCloudStorageApiError) {
            const errorMessage = error.message || defaultMessage;
            const fileKeyContext = context?.fileKey ? ` "${context.fileKey}"` : '';

            switch (error.code) {
                case 404:
                    throw new NotFoundException(
                        errorMessage || `File${fileKeyContext} not found`,
                        { cause: error }
                    );
                case 409:
                    throw new ConflictException(
                        errorMessage || `File${fileKeyContext} already exists`,
                        { cause: error }
                    );
                case 403:
                    throw new ForbiddenException(
                        errorMessage || `File${fileKeyContext} is not accessible`,
                        { cause: error }
                    );
                case 400:
                    throw new BadRequestException(errorMessage || defaultMessage, { cause: error });
                default:
                    throw new BadRequestException(errorMessage || defaultMessage, { cause: error });
            }
        }

        // Handle OAuth-style errors (e.g., {"error": "invalid_grant", "error_description": "..."})
        if (
            parsedErrorWrapped &&
            typeof parsedErrorWrapped === 'object' &&
            'error' in parsedErrorWrapped &&
            typeof parsedErrorWrapped.error === 'string'
        ) {
            const oauthError = parsedErrorWrapped as {
                error: string;
                error_description?: string;
                error_subtype?: string;
                error_uri?: string;
            };

            // Specifically handle invalid_rapt (reauthentication required)
            if (oauthError.error === 'invalid_grant' && oauthError.error_subtype === 'invalid_rapt') {
                const baseMessage = oauthError.error_description || 'Reauthentication required';
                const helpMessage = 'Google Cloud requires reauthentication. Please refresh your credentials.';
                const errorUri = oauthError.error_uri
                    ? ` For more information, see: ${oauthError.error_uri}`
                    : '';

                throw new BadRequestException(
                    `${baseMessage}. ${helpMessage}${errorUri}`,
                    { cause: error }
                );
            }

            // Handle other OAuth errors
            const errorMessage = oauthError.error_description || oauthError.error || defaultMessage;
            throw new BadRequestException(errorMessage, { cause: error });
        }

        // Handle Google Cloud Storage API errors with code and message structure
        const parsedError = parsedErrorWrapped !== null
            && typeof parsedErrorWrapped === 'object'
            && 'error' in parsedErrorWrapped
            && typeof parsedErrorWrapped.error === 'string'
            ? parsedErrorWrapped.error
            : parsedErrorWrapped;

        if (
            parsedError &&
            typeof parsedError === 'object' &&
            'code' in parsedError && parsedError.code
            && 'message' in parsedError && parsedError.message
        ) {
            const errorMessage = parsedError.message || defaultMessage;
            const fileKeyContext = context?.fileKey ? ` "${context.fileKey}"` : '';

            switch (parsedError.code) {
                case 404:
                    throw new NotFoundException(
                        errorMessage || `File${fileKeyContext} not found`,
                        { cause: error }
                    );
                case 409:
                    throw new ConflictException(
                        errorMessage || `File${fileKeyContext} already exists`,
                        { cause: error }
                    );
                case 403:
                    throw new ForbiddenException(
                        errorMessage || `File${fileKeyContext} is not accessible`,
                        { cause: error }
                    );
                case 400:
                    throw new BadRequestException(errorMessage || defaultMessage, { cause: error });
                default:
                    throw new BadRequestException(errorMessage || defaultMessage, { cause: error });
            }
        }

        // Handle generic Error instances
        if (error instanceof Error) {
            // Check for common error patterns
            if (error.message?.includes('does not exist')) {
                const fileKeyContext = context?.fileKey
                    ? ` "${context.fileKey}"`
                    : '';
                throw new NotFoundException(
                    `File${fileKeyContext} does not exist`,
                    { cause: error }
                );
            }
            throw new BadRequestException(error.message || defaultMessage, { cause: error });
        }

        // Unknown error type (generic error)
        throw new BadRequestException(defaultMessage, { cause: error });
    }


    /**
     * List files in the GCS bucket
     * @param pagination - Pagination options (limit)
     * @returns List of files with metadata (key, lastModified, size)
     * @throws Error if listing fails
     */
    async getFiles(pagination?: IPaginationOptions) {
        const limit = pagination?.limit || 10;

        try {
            const [files] = await this.storage.bucket(this.bucketName).getFiles({
                maxResults: limit,
                // TODO: Implement pagination
                // pageToken: page > 1 ? this.calculatePageToken(page, limit) : undefined,
            });

            const fileList = files.map(file => ({
                key: file.name,
                lastModified: file.metadata.updated,
                size: parseInt(file.metadata.size.toString() || '0'),
            }));

            return {
                files: fileList,
            };
        } catch (error) {
            this.handleGoogleCloudStorageError(
                error,
                'Failed to list files'
            );
        }
    }

    /**
     * Get file metadata and generate a signed URL (for private assets only)
     * 
     * Use this method for private files that were uploaded via /secure endpoint.
     * Public assets already have URLs from upload response, so this is not needed for them.
     * 
     * @param fileKey - The file key stored in database (for private assets)
     * @param expirationHours - How long the signed URL should be valid (default: 168 hours = 7 days)
     * @returns File metadata with signed URL (downloadUrl) that expires after specified hours
     * @throws Error if file doesn't exist or retrieval fails
     * 
     * @example
     * // For user profile pictures uploaded via /secure
     * const file = await mediaService.getFile('profile-123-1718192000000.jpg', 7 * 24);
     * // Returns: { key, size, lastModified, contentType, downloadUrl, expiresInHours }
     */
    async getFile(fileKey: string, expirationHours: number = 7 * 24) {
        try {
            const file = this.storage.bucket(this.bucketName).file(fileKey);

            // Check if file exists and get metadata
            const [exists] = await file.exists();
            if (!exists) {
                throw new NotFoundException(`File with name "${fileKey}" does not exist`);
            }

            const [metadata] = await file.getMetadata();
            const isPublic = await file.isPublic();
            let downloadUrl: string;

            // Generate signed URL (default: 7 days for profile images)
            if (!isPublic) {
                const [signedUrl] = await file.getSignedUrl({
                    action: 'read',
                    expires: Date.now() + (expirationHours * 60 * 60 * 1000),
                });
                downloadUrl = signedUrl;
            } else {

                downloadUrl = file.publicUrl();
            }

            return {
                key: fileKey,
                size: parseInt(metadata.size.toString() || '0'),
                lastModified: metadata.updated,
                contentType: metadata.contentType,
                downloadUrl: downloadUrl,
                ...(isPublic ? {} : {
                    expiresInHours: expirationHours,
                }),
            };
        } catch (error) {
            this.handleGoogleCloudStorageError(
                error,
                'Failed to get file',
                { fileKey }
            );
        }
    }

    /**
     * Upload a file to Google Cloud Storage
     * 
     * Default behavior: Makes file public (accessible via direct URL)
     * Secure mode: Keeps file private (requires signed URLs for access)
     * 
     * @param file - The file to upload (Express.Multer.File)
     * @param isSecure - If true, file remains private and requires signed URLs. If false (default), file is made public.
     * @returns Upload result containing:
     *   - fileKey: Unique file identifier (store this in database)
     *   - fileUploadUrl: Public URL (if isSecure=false) or signed URL (if isSecure=true)
     *   - isSecure: Boolean indicating if file is private
     *   - size: File size in bytes
     *   - bucket: GCS bucket name
     *   - etag: File ETag
     * 
     * @throws Error if upload fails
     * 
     * @example
     * // Public asset (default) - for campus logos, university logos, etc.
     * const result = await mediaService.uploadFile(file, false);
     * // result.fileUploadUrl is a public URL that can be used directly
     * 
     * // Private asset - for user profile pictures, sensitive documents
     * const result = await mediaService.uploadFile(file, true);
     * // result.fileUploadUrl is a signed URL (expires in 7 days)
     * // Store result.fileKey in database, use GET /:fileKey to refresh URL when needed
     */
    async uploadFile(file: Express.Multer.File, isSecure: boolean = false) {
        /**
         * This function generates a unique file key by appending a timestamp to the original file name.
         * It ensures that the file name is unique by adding a timestamp to the file name.
         * Input: 'image.123.jpg'
         * Output: 'image.123-1718192000000.jpg'
         * @param baseKey - The original file name.
         * @returns A unique file key with a timestamp appended to the original file name.
         */
        const getUniqueFileKey = (baseKey: string): string => {
            const timestamp = Date.now();
            const nameParts = baseKey.split('.'); // e.g. ['image', '123', 'jpg']
            const extension = nameParts.pop(); // e.g. 'jpg'
            const baseName = nameParts.join('.'); // e.g. 'image.123'
            return `${baseName}-${timestamp}.${extension}`; // e.g. 'image-123-1718192000000.jpg'
        };

        const fileKey = /* getUniqueFileKey */(file.originalname);
        let fileUploadUrl: string /* = `${this.bucketPath}/${fileKey}` */;
        try {
            const gcsFile = this.storage.bucket(this.bucketName).file(fileKey);

            await gcsFile.save(file.buffer, {
                metadata: {
                    contentType: file.mimetype,
                },
            });

            // Default behavior: make file public (for public assets like logos, banners, etc.)
            // For secure uploads, skip makePublic() to keep file private
            if (!isSecure) {
                // Sets the file's ACL to allow public read access
                // await gcsFile.makePublic(); // ? Not Possible in uniform bucket-level access. (Only allowed for Fine-grained ACL access)

                // Gets the public URL of the file (The public URL without the .makePublic() call will still result in a 403 error)
                const publicUrl = gcsFile.publicUrl();
                fileUploadUrl = publicUrl;
            } else {
                // TODO: Not Possible to get signed URL without `client-email` and `private-key` in the credentials.
                const [signedUrl] = await gcsFile.getSignedUrl({
                    action: 'read',
                    expires: Date.now() + (7 * 24 * 60 * 60 * 1000),
                });
                fileUploadUrl = signedUrl;
            }

            const uploadedFile = {
                fileKey,
                etag: gcsFile.metadata.etag,
                bucket: this.bucketName,
                size: file.size,
                isSecure,
                fileUploadUrl
            };

            return uploadedFile;
        } catch (error) {
            this.handleGoogleCloudStorageError(
                error,
                'Failed to upload file',
                { fileKey }
            );
        }
    }

    /**
     * Delete a file from GCS bucket
     * 
     * @param fileKey - The file key/path to delete (e.g., 'profile-123-1718192000000.jpg')
     * @returns Object with deleted fileKey
     * @throws Error if file doesn't exist or deletion fails
     * 
     * @example
     * await mediaService.deleteFile('profile-123-1718192000000.jpg');
     * // Returns: { fileKey: 'profile-123-1718192000000.jpg' }
     */
    async deleteFile(fileKey: string) {
        try {
            const file = this.storage.bucket(this.bucketName).file(fileKey);

            // Check if file exists
            const [exists] = await file.exists();
            if (!exists) {
                throw new NotFoundException(`File with name "${fileKey}" does not exist`);
            }

            await file.delete();

            return {
                fileKey,
            };
        } catch (error) {
            this.handleGoogleCloudStorageError(
                error,
                'Failed to delete file',
                { fileKey }
            );
        }
    }
}