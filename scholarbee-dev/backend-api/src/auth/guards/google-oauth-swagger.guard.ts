import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import { AuthStrategyEnum } from 'src/auth/strategies/strategy.enum';
import { ConfigService } from '@nestjs/config';

/**
 * Swagger-specific Google OAuth Guard
 * 
 * This guard exists to provide a separate OAuth flow specifically for Swagger UI authentication.
 * Unlike the main Google OAuth flow which redirects to the frontend application, this guard
 * overrides the callback URL to point to a backend-controlled endpoint that can intercept tokens
 * and communicate them back to the Swagger UI via postMessage.
 * 
 * **Why this guard exists:**
 * - Swagger UI runs in the browser and needs to receive authentication tokens to make authenticated
 *   API calls. The frontend callback URL approach doesn't work because:
 *   1. The backend doesn't control the frontend URL
 *   2. We need to intercept tokens before they reach the frontend
 *   3. We need to serve an HTML page that can communicate with the parent Swagger UI window
 * 
 * - By using a separate guard with a different callback URL, we can:
 *   1. Keep the Swagger OAuth flow completely separate from the frontend flow
 *   2. Avoid conditional logic in the main callback handler
 *   3. Follow NestJS conventions by having dedicated endpoints for different use cases
 * 
 * **How it works:**
 * 1. When `/api/auth/google/swagger` is called, this guard overrides the callback URL
 * 2. Google redirects to `/api/auth/google/swagger-callback` (must be registered in Google OAuth console)
 * 3. The callback handler redirects to `/api/docs/auth-callback` with tokens in query params
 * 4. The SwaggerAuthController serves an HTML page that extracts tokens and sends them to Swagger UI
 * 
 * **Configuration requirements:**
 * - The callback URL `/api/auth/google/swagger-callback` must be registered as an authorized
 *   redirect URI in your Google OAuth console configuration.
 * 
 * @see GoogleOAuthGuard - The main Google OAuth guard for frontend authentication
 * @see SwaggerAuthController - Handles the final callback that serves HTML to Swagger UI
 */
@Injectable()
export class GoogleOAuthSwaggerGuard extends AuthGuard(AuthStrategyEnum.GoogleStrategy) {
    constructor(private readonly configService: ConfigService) {
        super();
    }

    /**
     * Overrides the OAuth authentication options to use a Swagger-specific callback URL.
     * 
     * This method dynamically constructs the callback URL based on the current request's
     * protocol and host, ensuring it works correctly in different environments (dev, staging, prod).
     * 
     * @param context - The execution context containing the HTTP request
     * @returns Authentication options with the Swagger callback URL and account selection prompt
     */
    getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions {
        const req = context.switchToHttp().getRequest();

        // Override callback URL for Swagger
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const swaggerCallbackUrl = `${baseUrl}/api/auth/google/swagger-callback`;

        const options: IAuthModuleOptions = {
            // This is required to force Google to show the "Select Account" dialog before login
            prompt: 'select_account',
            // Override callback URL for Swagger
            callbackURL: swaggerCallbackUrl,
        };

        return options;
    }

    /**
     * Handles OAuth errors and user data from the Google OAuth strategy.
     * 
     * Instead of throwing errors, this method stashes them on the request object
     * so the controller can handle them gracefully and redirect appropriately.
     * 
     * @param err - Error from the OAuth strategy, if any
     * @param user - User object from successful authentication, if any
     * @param info - Additional info from the OAuth strategy
     * @param context - The execution context
     * @returns The user object if authentication succeeded, null otherwise
     */
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        if (err) {
            req.oauthError = err;
        } else if (info) {
            req.oauthError = info;
        }

        // Return user or null; do not throw, so controller can decide how to respond
        return user || null;
    }
}

