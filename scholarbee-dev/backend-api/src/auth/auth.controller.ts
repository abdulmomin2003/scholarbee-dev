import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Request,
  Res,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { RefreshAuthenticationGuard } from 'src/auth/guards/refresh-authentication.guard';
import { MongoTransactionService } from 'src/common/database/mongo-transaction.service';
import { RequestContextService } from 'src/common/services/request-context.service';
import { UsersService } from '../users/users.service';
import { ChangePasswordAuthApiDoc } from './api-docs/change-password-auth.api-doc';
import { DebugHashAuthApiDoc } from './api-docs/debug-hash-auth.api-doc';
import { ForgotPasswordAuthApiDoc } from './api-docs/forgot-password-auth.api-doc';
import { GoogleAuthApiDoc } from './api-docs/google-auth.api-doc';
import { GoogleAuthCallbackAuthApiDoc } from './api-docs/google-callback-auth.api-doc';
import { LoginAuthApiDoc } from './api-docs/login-auth.api-doc';
import { LogoutAuthApiDoc } from './api-docs/logout-auth.api-doc';
import { RefreshAuthApiDoc } from './api-docs/refresh-auth.api-doc';
import { ResendPasswordResetAuthApiDoc } from './api-docs/resend-password-reset-auth.api-doc';
import { ResendVerificationAuthApiDoc } from './api-docs/resend-verification-auth.api-doc';
import { ResetPasswordAuthApiDoc } from './api-docs/reset-password-auth.api-doc';
import { SignupAuthApiDoc } from './api-docs/signup-auth.api-doc';
import { ValidateResetTokenAuthApiDoc } from './api-docs/validate-reset-token-auth.api-doc';
import { VerifyEmailAuthApiDoc } from './api-docs/verify-email-auth.api-doc';
import { AuthService } from './auth.service';
import { AuthReq, LoginReq } from './decorators/auth-req.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResendPasswordResetDto } from './dto/resend-password-reset.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupDto } from './dto/signup.dto';
import { GoogleOAuthSwaggerGuard } from './guards/google-oauth-swagger.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { LocalAuthenticationGuard } from './guards/local-authentication.guard';
import { ResourceProtectionGuard } from './guards/resource-protection.guard';
import { AuthenticatedRequest, LoginRequest } from './types/auth.interface';

@ApiTags('auth -> ✅ (Verified)')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private requestContextService: RequestContextService,
    private readonly configService: ConfigService,
    private readonly mongoTransactionService: MongoTransactionService,
  ) { }

  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginAuthApiDoc()
  async login(@LoginReq() req: LoginRequest) {
    const isAdminHost = this.requestContextService.getIsAdminHost();
    return this.authService.login(req.user, isAdminHost);
  }

  // Google OAuth endpoints for frontend
  @UseGuards(GoogleOAuthGuard)
  @Get('google')
  @GoogleAuthApiDoc()
  async googleAuth(@Request() req, @Res() res: Response) {
    // Initiates Google OAuth flow (Passport handles the redirect)
    return;
  }

  @UseGuards(GoogleOAuthGuard)
  @GoogleAuthCallbackAuthApiDoc()
  @Get('google/callback')
  async googleAuthCallback(@Request() req, @Res() res: Response) {
    const frontendBaseUrl = this.configService.get<string>('frontend.url', { infer: true });

    try {
      const isAdminHost = this.requestContextService.getIsAdminHost();
      const redirectToLogin = (message: string) => {
        const loginUrl = `${frontendBaseUrl}/login`;
        const params = new URLSearchParams({ oauth_error: String(message) });
        return res.redirect(`${loginUrl}?${params.toString()}`);
      };

      // If authentication failed, "req.user" will be undefined/null; redirect with a helpful error
      if (!req?.user) {
        const message = req?.oauthError?.message || req?.oauthError || 'Unable to sign in with Google. Email may already be registered with password login.';
        console.error('❌ Google OAuth callback failed: User not populated on request.', {
          oauthError: req?.oauthError,
          message,
        });
        return redirectToLogin(message);
      }

      const result = await this.authService.login(req.user, isAdminHost);

      const callbackUrl = `${frontendBaseUrl}/auth/callback`;
      const searchParams = new URLSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        userId: String(result.user._id ?? ''),
      });

      return res.redirect(`${callbackUrl}?${searchParams.toString()}`);
    } catch (error) {
      console.error('❌ Google OAuth callback exception:', error);
      // On any error (e.g., 409 conflict for existing email), redirect to login with a user-friendly message
      const message = error?.message || 'Unable to sign in with Google. Please try another method.';
      const loginUrl = `${frontendBaseUrl}/login`;
      const params = new URLSearchParams({ oauth_error: String(message) });
      return res.redirect(`${loginUrl}?${params.toString()}`);
    }
  }

  /**
   * Swagger-specific Google OAuth endpoints
   * 
   * These endpoints exist to provide a separate OAuth flow specifically for Swagger UI,
   * distinct from the main frontend OAuth flow. This separation eliminates the need for
   * conditional logic in the main callback handler and makes the codebase more maintainable.
   * 
   * **Why separate endpoints:**
   * - Swagger UI needs to receive tokens in a way that can be intercepted by backend-controlled
   *   code (HTML page with postMessage), not redirected to the frontend application
   * - Having dedicated endpoints makes the authentication flow explicit and easier to understand
   * - Follows the principle of separation of concerns
   */

  /**
   * Initiates Google OAuth flow for Swagger UI
   * 
   * This endpoint starts the Google OAuth authentication process specifically for Swagger UI.
   * It uses GoogleOAuthSwaggerGuard which overrides the callback URL to point to
   * `/api/auth/google/swagger-callback` instead of the frontend callback URL.
   * 
   * **Flow:**
   * 1. User clicks "Sign in with Google" in Swagger UI
   * 2. Swagger plugin opens popup to this endpoint
   * 3. GoogleOAuthSwaggerGuard overrides callback URL
   * 4. Passport redirects to Google OAuth consent screen
   * 5. Google redirects back to `/api/auth/google/swagger-callback`
   * 
   * **Note:** The callback URL `/api/auth/google/swagger-callback` must be registered
   * as an authorized redirect URI in your Google OAuth console.
   * 
   * @param req - Express request object
   * @param res - Express response object (Passport handles the redirect)
   * @returns Nothing - Passport handles the redirect to Google
   * 
   * @see GoogleOAuthSwaggerGuard - Overrides callback URL for Swagger flow
   * @see googleAuthSwaggerCallback - Handles the OAuth callback
   */
  @UseGuards(GoogleOAuthSwaggerGuard)
  @Get('google/swagger')
  @GoogleAuthApiDoc()
  async googleAuthSwagger(@Request() req, @Res() res: Response) {
    // Initiates Google OAuth flow for Swagger (Passport handles the redirect)
    // Uses GoogleOAuthSwaggerGuard which overrides callback URL to /api/auth/google/swagger-callback
    return;
  }

  /**
   * Handles Google OAuth callback for Swagger UI
   * 
   * This endpoint receives the OAuth callback from Google after user authentication.
   * It processes the authentication result and redirects to the Swagger callback page
   * (`/api/docs/auth-callback`) with tokens or error information in query parameters.
   * 
   * **Important:** This is NOT the same as `/api/docs/auth-callback`. They serve different purposes:
   * - This endpoint (`/api/auth/google/swagger-callback`): OAuth callback from Google that processes
   *   authentication and generates tokens. This is what Google redirects to.
   * - `/api/docs/auth-callback`: Final HTML page that delivers tokens to Swagger UI via postMessage.
   * 
   * **Complete Flow:**
   * 1. User clicks "Sign in with Google" in Swagger UI
   * 2. Popup opens to `/api/auth/google/swagger`
   * 3. Google OAuth redirects to this endpoint (`/api/auth/google/swagger-callback`)
   * 4. This endpoint validates user, generates tokens, then redirects to `/api/docs/auth-callback`
   * 5. `/api/docs/auth-callback` serves HTML that delivers tokens to Swagger UI via postMessage
   * 
   * **Why this endpoint exists:**
   * - Provides a dedicated OAuth callback handler for Swagger (separate from frontend flow)
   * - Avoids conditional logic in the main `googleAuthCallback` endpoint
   * - Makes the Swagger authentication flow explicit and maintainable
   * - Allows different error handling/redirect logic for Swagger vs frontend
   * 
   * @param req - Express request object containing OAuth result and user data
   * @param res - Express response object for redirecting
   * @returns Redirects to `/api/docs/auth-callback` with tokens or error
   * 
   * @see googleAuthSwagger - Initiates the Swagger OAuth flow
   * @see SwaggerAuthController.authCallback - Final callback that serves HTML to deliver tokens
   */
  @UseGuards(GoogleOAuthSwaggerGuard)
  @Get('google/swagger-callback')
  async googleAuthSwaggerCallback(@Request() req, @Res() res: Response) {
    try {
      const isAdminHost = this.requestContextService.getIsAdminHost();

      // If authentication failed
      if (!req?.user) {
        const message = req?.oauthError?.message || req?.oauthError || 'Unable to sign in with Google. Email may already be registered with password login.';
        // Redirect to Swagger callback page with error
        const swaggerCallbackUrl = '/api/docs/auth-callback';
        const params = new URLSearchParams({ error: String(message) });
        return res.redirect(`${swaggerCallbackUrl}?${params.toString()}`);
      }

      const result = await this.authService.login(req.user, isAdminHost);

      // Redirect to Swagger callback page with tokens
      const swaggerCallbackUrl = '/api/docs/auth-callback';
      const searchParams = new URLSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        userId: String(result.user._id ?? ''),
        email: result.user.email || '',
      });

      return res.redirect(`${swaggerCallbackUrl}?${searchParams.toString()}`);
    } catch (error) {
      // On any error, redirect to Swagger callback page with error
      const message = error?.message || 'Unable to sign in with Google. Please try another method.';
      const swaggerCallbackUrl = '/api/docs/auth-callback';
      const params = new URLSearchParams({ error: String(message) });
      return res.redirect(`${swaggerCallbackUrl}?${params.toString()}`);
    }
  }

  @UseGuards(ResourceProtectionGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @LogoutAuthApiDoc()
  async logout(@AuthReq() req: AuthenticatedRequest) {
    return this.authService.logout(req.user);
  }

  @UseGuards(RefreshAuthenticationGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @RefreshAuthApiDoc()
  async refreshAuthTokens(@Request() req) {
    console.log('🔄 Refresh endpoint called:', {
      hasUser: !!req.user,
      userId: req.user?._id,
      userEmail: req.user?.email,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await this.authService.refreshAuthTokens(req.user);
      console.log('✅ Refresh tokens generated successfully:', {
        userId: result.user._id,
        hasAccessToken: !!result.accessToken,
        hasRefreshToken: !!result.refreshToken,
        timestamp: new Date().toISOString(),
      });
      return result;
    } catch (error) {
      console.log('❌ Refresh tokens generation failed:', {
        error: error.message,
        errorType: error.constructor?.name,
        userId: req.user?._id,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @SignupAuthApiDoc()
  // TODO: Enforce only student user type
  async signup(@Body() signupDto: SignupDto) {

    return this.authService.handleUserSignup(signupDto);
  }

  @UseGuards(ThrottlerGuard)
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ForgotPasswordAuthApiDoc()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.sendPasswordResetEmail(forgotPasswordDto.email);
  }

  @Post('reset-password/:token')
  @HttpCode(HttpStatus.OK)
  @ResetPasswordAuthApiDoc()
  async resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, resetPasswordDto.password);
  }

  @Get('validate-reset-token/:token')
  @HttpCode(HttpStatus.OK)
  @ValidateResetTokenAuthApiDoc()
  async validateResetToken(@Param('token') token: string) {
    return this.authService.validateResetPasswordToken(token);
  }

  @Get('verify/:token')
  @VerifyEmailAuthApiDoc()
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @UseGuards(ThrottlerGuard)
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ResendVerificationAuthApiDoc()
  async resendVerificationEmail(
    @Body() resendVerificationDto: ResendVerificationDto,
  ) {
    return this.usersService.resendVerificationEmail(
      resendVerificationDto.email,
    );
  }

  @UseGuards(ThrottlerGuard)
  @Post('resend-password-reset')
  @HttpCode(HttpStatus.OK)
  @ResendPasswordResetAuthApiDoc()
  async resendPasswordResetEmail(
    @Body() resendPasswordResetDto: ResendPasswordResetDto,
  ) {
    return this.authService.sendPasswordResetEmail(
      resendPasswordResetDto.email,
    );
  }

  @UseGuards(ResourceProtectionGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ChangePasswordAuthApiDoc()
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.sub,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Get('debug-hash/:email')
  @DebugHashAuthApiDoc()
  async debugHash(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      email: user.email,
      hashType: user.hash?.substring(0, 10) + '...',
      hasSalt: !!user.salt,
      saltType: user.salt ? user.salt.substring(0, 10) + '...' : 'none',
    };
  }
}
