import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { SignupDto } from '../dto/signup.dto';

export function SignupAuthApiDoc() {
    return applyDecorators(
        ApiOperation({ summary: 'User signup', description: 'Register a new user account. If the email already exists and the user is not verified, a new verification email will be sent. If the user is already verified, the request will fail with a 409 Conflict error.' }),
        ApiBody({
            type: SignupDto, description: 'Signup data',
            examples: {
                'Basic Signup': {
                    value: {
                        "email": "superadmin@scholarbee.com",
                        "password": "SuperAdmin123!",
                        "full_name": "Super Admin",
                        "phone_number": "+1234567890",
                        "user_type": "Super_Admin",
                    }
                },
                'Signup with Discovery Info (Instagram)': {
                    value: {
                        "email": "user@example.com",
                        "password": "Password123!",
                        "full_name": "John Doe",
                        "phone_number": "+1234567890",
                        "user_type": "Student",
                        "discovery_info": {
                            "discovery_mode": "instagram"
                        },
                    }
                },
                'Signup with Invitation Code': {
                    value: {
                        "email": "user@example.com",
                        "password": "Password123!",
                        "full_name": "John Doe",
                        "phone_number": "+1234567890",
                        "user_type": "Student",
                        "discovery_info": {
                            "discovery_mode": "invitation",
                            "invitation_code": "hussnain50"
                        },
                    }
                }
            }
        }),
        ApiResponse({ status: 200, description: 'User created successfully. Returns auth tokens so the caller is immediately authenticated (if email already exist but not verified: "User already exists but is not verified. A new verification link has been sent to your email")', schema: { example: { message: 'User created successfully.', user: { _id: '507f1f77bcf86cd799439011', email: 'user@example.com' }, accessToken: '<jwt>', refreshToken: '<jwt>' } } }),
        ApiResponse({ status: 409, description: 'Email already exists (user is already verified).' }),
        ApiBadRequestResponse({ description: 'Invalid input or user creation failed' }),
    );
}
