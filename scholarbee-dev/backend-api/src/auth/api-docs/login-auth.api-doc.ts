import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';

export function LoginAuthApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'User login', description: 'Authenticate user with email and password and return access & refresh tokens.' }),
        ApiBody({
            type: LoginDto, description: 'Login credentials',
            examples: {
                'Basic Program': {
                    value: {
                        "email": "test112@mailinator.com",
                        "password": "Test@123"
                    }
                }
            }
        }),
        ApiResponse({
            status: 200,
            description: 'Login successful - returns tokens and basic user info',
            schema: {
                example: {
                    user: { _id: '507f1f77bcf86cd799439011', email: 'user@example.com', first_name: 'John', last_name: 'Doe' },
                    accessToken: 'eyJhbGci...access',
                    refreshToken: 'eyJhbGci...refresh',
                    token: 'eyJhbGci...access',
                    userId: '507f1f77bcf86cd799439011',
                    username: 'user@example.com'
                }
            }
        }),
        ApiUnauthorizedResponse({ description: 'Invalid credentials or unauthorized' }),
    );
}
