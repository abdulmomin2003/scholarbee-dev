import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiQuery } from '@nestjs/swagger';

export function FindAllUsersApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'List users', description: 'Return a paginated list of users. Supports query parameters: page, limit, search, user_type.' }),
        ApiQuery({ name: 'page', required: false, description: 'Page number' }),
        ApiQuery({ name: 'limit', required: false, description: 'Items per page' }),
        ApiQuery({ name: 'search', required: false, description: 'Search text for name/email' }),
        ApiQuery({ name: 'user_type', required: false, description: 'Filter by user type (e.g. student)' }),
        ApiResponse({
            status: 200,
            description: 'Paginated users list',
            schema: {
                example: {
                    docs: [
                        {
                            _id: '507f1f77bcf86cd799439011',
                            email: 'user@example.com',
                            first_name: 'John',
                            last_name: 'Doe',
                            user_type: 'student',
                            phone_number: '+923001234567'
                        }
                    ],
                    totalDocs: 1,
                    page: 1,
                    totalPages: 1
                }
            }
        }),
        ApiUnauthorizedResponse({ description: 'Authentication required' }),
    );
}
