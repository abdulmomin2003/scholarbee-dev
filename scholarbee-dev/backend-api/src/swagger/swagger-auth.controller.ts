import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';

/**
 * Controller for Swagger UI authentication callbacks
 * 
 * This controller exists to handle OAuth callback redirects specifically for Swagger UI.
 * Unlike the frontend authentication flow which redirects to the frontend application,
 * this controller serves an HTML page that can communicate with the parent Swagger UI window
 * via postMessage to deliver authentication tokens.
 * 
 * **Why this controller exists:**
 * - Swagger UI runs in the browser and needs to receive authentication tokens to make
 *   authenticated API calls. The standard frontend callback approach doesn't work because:
 *   1. The backend needs to control the callback URL to intercept tokens
 *   2. We need to serve an HTML page that can communicate with the parent window
 *   3. The tokens must be delivered to Swagger UI's JavaScript context, not the frontend app
 * 
 * - By having a dedicated controller for Swagger callbacks, we:
 *   1. Follow NestJS conventions (controllers in modules, not routes in main.ts)
 *   2. Keep Swagger-specific logic separate from general authentication logic
 *   3. Make the codebase more maintainable and testable
 * 
 * **Authentication flow:**
 * 1. User clicks "Sign in with Google" in Swagger UI
 * 2. Popup opens to `/api/auth/google/swagger`
 * 3. Google OAuth redirects to `/api/auth/google/swagger-callback` (OAuth callback handler)
 * 4. `/api/auth/google/swagger-callback` processes authentication and redirects here with tokens
 * 5. This endpoint (`/api/docs/auth-callback`) serves an HTML page that:
 *    - Extracts tokens from URL query parameters
 *    - Stores them in localStorage (fallback)
 *    - Sends them to the parent Swagger UI window via postMessage
 *    - Closes the popup window
 * 
 * **Note:** This endpoint is the final step in the Swagger OAuth flow. It receives tokens
 * from `/api/auth/google/swagger-callback` and delivers them to Swagger UI. These two
 * endpoints are sequential, not alternatives - they serve different purposes in the flow.
 * 
 * **Security considerations:**
 * - Tokens are passed in URL query parameters, which may appear in browser history/logs
 * - This is acceptable for Swagger UI as it's a development tool
 * - The HTML page uses postMessage with origin validation in the receiving code
 * 
 * @see GoogleOAuthSwaggerGuard - The guard that initiates the Swagger OAuth flow
 * @see AuthController.googleAuthSwaggerCallback - The endpoint that redirects here with tokens
 */
@Controller('api/docs')
export class SwaggerAuthController {
  /**
   * Handles the OAuth callback for Swagger UI authentication
   * 
   * This endpoint receives authentication tokens (or errors) from the OAuth flow and serves
   * an HTML page that communicates them back to the parent Swagger UI window.
   * 
   * **Flow:**
   * 1. Receives tokens/error in query parameters from AuthController.googleAuthSwaggerCallback
   * 2. Serves an HTML page with embedded JavaScript
   * 3. JavaScript extracts tokens from URL and sends them to parent window via postMessage
   * 4. Parent window (Swagger UI plugin) receives tokens and stores them
   * 5. Popup closes automatically
   * 
   * **Query Parameters:**
   * - `accessToken` (optional): JWT access token for API authentication
   * - `refreshToken` (optional): Refresh token for obtaining new access tokens
   * - `userId` (optional): User ID for identification
   * - `email` (optional): User email address
   * - `error` (optional): Error message if authentication failed
   * 
   * @param accessToken - JWT access token from successful authentication
   * @param refreshToken - Refresh token for token renewal
   * @param userId - Authenticated user's ID
   * @param email - Authenticated user's email
   * @param error - Error message if authentication failed
   * @param res - Express response object for sending HTML
   * @returns HTML page that handles token delivery to Swagger UI
   */
  @Get('auth-callback')
  async authCallback(
    @Query('accessToken') accessToken: string,
    @Query('refreshToken') refreshToken: string,
    @Query('userId') userId: string,
    @Query('email') email: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Swagger Authentication</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 400px;
    }
    .success { color: #4CAF50; }
    .error { color: #f44336; }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #4CAF50;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    ${error ? `
      <h2 class="error">❌ Authentication Failed</h2>
      <p>${error}</p>
      <p>This window will close automatically.</p>
    ` : accessToken ? `
      <h2 class="success">✅ Authentication Successful</h2>
      <p>Setting up your session...</p>
      <div class="spinner"></div>
      <p>This window will close automatically.</p>
    ` : `
      <h2>⏳ Processing...</h2>
      <div class="spinner"></div>
    `}
  </div>
  <script>
    (function() {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('accessToken');
      const refreshToken = urlParams.get('refreshToken');
      const userId = urlParams.get('userId');
      const email = urlParams.get('email');
      const error = urlParams.get('error');

      if (error) {
        // Send error to parent window if opened in popup
        if (window.opener) {
          window.opener.postMessage({
            type: 'swagger-oauth-callback',
            error: error
          }, '*');
        }
        setTimeout(() => window.close(), 3000);
        return;
      }

      if (accessToken) {
        // Store token in localStorage
        localStorage.setItem('swagger_access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('swagger_refresh_token', refreshToken);
        }
        if (userId) {
          localStorage.setItem('swagger_user_id', userId);
        }
        if (email) {
          localStorage.setItem('swagger_user_email', email);
        }

        // Send success message to parent window if opened in popup
        if (window.opener) {
          window.opener.postMessage({
            type: 'swagger-oauth-callback',
            accessToken: accessToken,
            refreshToken: refreshToken,
            userId: userId,
            email: email
          }, '*');
          
          // Close popup after a short delay
          setTimeout(() => {
            window.close();
          }, 1000);
        } else {
          // Not in popup, redirect to Swagger docs
          setTimeout(() => {
            window.location.href = '/api/docs';
          }, 1500);
        }
      }
    })();
  </script>
</body>
</html>
    `;

    res.send(html);
  }
}

