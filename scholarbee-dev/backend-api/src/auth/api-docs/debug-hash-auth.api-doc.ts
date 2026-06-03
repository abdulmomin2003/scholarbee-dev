import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export function DebugHashAuthApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'Debug hash for user', description: 'Return partial information about stored password/hash for debugging (admin/dev only)(Frontend Dependent).' }),
        ApiParam({ name: 'email', description: 'User email to inspect', required: true, type: String }),
        ApiResponse({ status: 200, description: 'Debug info', schema: { example: { email: 'user@example.com', hashType: 'argon2$...', hasSalt: true, saltType: 'randomsalt...' } } }),
        ApiNotFoundResponse({ description: 'User not found' }),
    );
}
