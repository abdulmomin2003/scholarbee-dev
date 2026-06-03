# Swagger UI Authentication Flow Documentation

This document explains the complete flow of authentication in Swagger UI for the ScholarBee backend, including both email/password and Google OAuth authentication methods.

## Overview

Swagger UI requires a special authentication flow because:
1. It runs in the browser and needs to receive authentication tokens
2. The backend must control the callback URL to intercept tokens
3. Tokens must be delivered to Swagger UI's JavaScript context via `postMessage`
4. Unlike the frontend app, Swagger UI cannot handle standard OAuth redirects

The authentication process supports two methods:
1. **Email/Password Authentication**: Uses Basic Auth dialog in Swagger UI
2. **Google OAuth Authentication**: Uses a popup window with OAuth flow

## Architecture Overview

The Swagger authentication flow uses dedicated endpoints separate from the main frontend authentication:
- `/api/auth/google/swagger` - Initiates Google OAuth for Swagger
- `/api/auth/google/swagger-callback` - Handles OAuth callback from Google
- `/api/docs/auth-callback` - Final HTML page that delivers tokens to Swagger UI
- Custom Swagger plugin (`swagger-auth-plugin.js`) - Handles authentication UI and token management

## Complete Flow Diagram - Email/Password Authentication

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User clicks "Authorize" in Swagger UI                      │
│    - Swagger UI shows Basic Auth dialog                        │
│    - User enters email and password                            │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. SwaggerAuthPlugin intercepts Basic Auth                    │
│    - Plugin's requestInterceptor catches Basic Auth header     │
│    - Decodes email:password from Authorization header          │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Plugin calls POST /api/auth/login                           │
│    - Sends { email, password } in request body                │
│    - Receives { user, accessToken, refreshToken }              │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Plugin stores tokens and sets Bearer token                 │
│    - Stores tokens in localStorage                             │
│    - Sets Bearer token in Swagger UI via authActions           │
│    - Updates UI to show logged-in state                       │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Subsequent API calls use Bearer token                       │
│    - Plugin's requestInterceptor adds Authorization header     │
│    - All /api/* requests include Bearer token automatically   │
└─────────────────────────────────────────────────────────────────┘
```

## Complete Flow Diagram - Google OAuth Authentication

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User clicks "Sign in with Google" in Swagger UI            │
│    - SwaggerAuthPlugin opens popup window                      │
│    - Popup navigates to /api/auth/google/swagger               │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. GoogleOAuthSwaggerGuard intercepts request                 │
│    - Overrides callback URL to /api/auth/google/swagger-callback│
│    - Passport redirects to Google OAuth consent screen        │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. User authenticates with Google                             │
│    - Google shows account selection                            │
│    - User selects account and grants permission                │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Google redirects to /api/auth/google/swagger-callback      │
│    - GoogleOAuthSwaggerGuard validates OAuth response          │
│    - GoogleOAuthStrategy.validate() processes Google profile   │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. AuthController.googleAuthSwaggerCallback()                  │
│    - Validates user (creates if new)                           │
│    - Calls authService.login() to generate tokens              │
│    - Redirects to /api/docs/auth-callback with tokens          │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. SwaggerAuthController.authCallback()                        │
│    - Serves HTML page with embedded JavaScript                 │
│    - JavaScript extracts tokens from URL query params         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. HTML page sends tokens to parent window                    │
│    - Stores tokens in localStorage (fallback)                 │
│    - Sends tokens via window.postMessage()                     │
│    - Closes popup window                                       │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. SwaggerAuthPlugin receives tokens via postMessage           │
│    - Listens for 'swagger-oauth-callback' message type         │
│    - Stores tokens in localStorage                             │
│    - Sets Bearer token in Swagger UI                           │
│    - Updates UI to show logged-in state                        │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Step-by-Step Explanation - Email/Password

### Step 1: User Initiates Authentication
User clicks the "Authorize" button in Swagger UI, which shows a Basic Auth dialog where they enter their email and password.

### Step 2: SwaggerAuthPlugin Intercepts Basic Auth
**File**: `public/swagger-auth-plugin.js`

The plugin intercepts the Basic Auth credentials:

```javascript
// Plugin overrides Swagger UI's authorize function
ui.getSystem().authActions.authorize = function(auth) {
  if (auth.basicAuth) {
    const credentials = atob(auth.basicAuth.value);
    const [email, password] = credentials.split(':');
    
    // Call login endpoint
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
      // Store tokens and set Bearer token
      localStorage.setItem('swagger_access_token', data.accessToken);
      setBearerToken(data.accessToken);
    });
  }
};
```

### Step 3: Plugin Calls Login Endpoint
The plugin makes a POST request to `/api/auth/login` with email and password. This follows the same flow as the local signin (see `local-signin-flow.md`):
- `LocalAuthenticationGuard` validates credentials
- `LocalAuthenticationStrategy` authenticates user
- `AuthService.login()` generates tokens
- Returns `{ user, accessToken, refreshToken }`

### Step 4: Plugin Stores Tokens and Updates UI
The plugin:
- Stores tokens in `localStorage` for persistence
- Sets Bearer token in Swagger UI using `authActions.authorize()`
- Updates the UI to show logged-in state (hides login form, shows logout button)

### Step 5: Request Interceptor Adds Bearer Token
**File**: `public/swagger-auth-plugin.js`

The plugin's `requestInterceptor` automatically adds the Bearer token to all API requests:

```javascript
swaggerOptions.requestInterceptor = (req) => {
  const token = localStorage.getItem('swagger_access_token');
  if (token && req.url.startsWith('/api/') && !req.url.includes('/auth/login')) {
    req.headers['Authorization'] = `Bearer ${token}`;
  }
  return req;
};
```

## Detailed Step-by-Step Explanation - Google OAuth

### Step 1: User Clicks "Sign in with Google"
**File**: `public/swagger-auth-plugin.js`

User clicks the Google sign-in button in the Swagger login form:

```javascript
function loginWithGoogle() {
  const popup = window.open(
    '/api/auth/google/swagger',
    'Google OAuth',
    'width=500,height=600,...'
  );
  
  // Listen for postMessage from callback page
  window.addEventListener('message', messageHandler);
}
```

### Step 2: GoogleOAuthSwaggerGuard Overrides Callback URL
**File**: `src/auth/guards/google-oauth-swagger.guard.ts`

The guard intercepts the request and overrides the callback URL:

```typescript
getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions {
  const req = context.switchToHttp().getRequest();
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const swaggerCallbackUrl = `${baseUrl}/api/auth/google/swagger-callback`;
  
  return {
    prompt: 'select_account',
    callbackURL: swaggerCallbackUrl, // Override for Swagger
  };
}
```

**Important**: The callback URL `/api/auth/google/swagger-callback` must be registered as an authorized redirect URI in your Google OAuth console.

### Step 3: Google OAuth Consent Screen
Passport redirects the popup to Google's OAuth consent screen where the user:
- Selects their Google account
- Grants permission to the application

### Step 4: Google Redirects to Swagger Callback
**File**: `src/auth/strategies/google-oauth.strategy.ts`

Google redirects back to `/api/auth/google/swagger-callback`. The `GoogleOAuthStrategy` validates the OAuth response:

```typescript
async validate(googleAccessToken: string, googleRefreshToken: string, profile: Profile) {
  const user = await this.authService.validateGoogleUser({
    googleId: profile.id,
    email: profile.emails?.[0]?.value,
    firstName: profile.name?.givenName,
    lastName: profile.name?.familyName,
    profileImageUrl: profile.photos?.[0]?.value,
  });
  return user; // Returns user object (creates if new)
}
```

### Step 5: AuthController Processes OAuth Callback
**File**: `src/auth/auth.controller.ts`

The `googleAuthSwaggerCallback` endpoint processes the authentication:

```typescript
@Get('google/swagger-callback')
async googleAuthSwaggerCallback(@Request() req, @Res() res: Response) {
  // req.user contains the user from GoogleOAuthStrategy.validate()
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
}
```

**What happens:**
1. Validates the user (creates new user if first-time Google login)
2. Calls `authService.login()` to generate JWT tokens
3. Redirects to `/api/docs/auth-callback` with tokens in query parameters

### Step 6: SwaggerAuthController Serves HTML Page
**File**: `src/swagger/swagger-auth.controller.ts`

The controller serves an HTML page that extracts tokens from the URL:

```typescript
@Get('auth-callback')
async authCallback(@Query('accessToken') accessToken: string, ...) {
  const html = `
    <script>
      const accessToken = urlParams.get('accessToken');
      // Store in localStorage
      localStorage.setItem('swagger_access_token', accessToken);
      // Send to parent window
      window.opener.postMessage({
        type: 'swagger-oauth-callback',
        accessToken: accessToken,
        ...
      }, '*');
      window.close();
    </script>
  `;
  res.send(html);
}
```

**What happens:**
1. Extracts tokens from URL query parameters
2. Stores tokens in `localStorage` (fallback)
3. Sends tokens to parent window via `postMessage`
4. Closes the popup window

### Step 7: Plugin Receives Tokens via postMessage
**File**: `public/swagger-auth-plugin.js`

The plugin listens for the `postMessage` event:

```javascript
const messageHandler = (event) => {
  if (event.data && event.data.type === 'swagger-oauth-callback') {
    if (event.data.accessToken) {
      // Store tokens
      localStorage.setItem('swagger_access_token', event.data.accessToken);
      
      // Set Bearer token in Swagger UI
      setBearerToken(event.data.accessToken);
      
      // Update UI
      showLoggedInState();
    }
  }
};
window.addEventListener('message', messageHandler);
```

### Step 8: Request Interceptor Adds Bearer Token
Same as Step 5 in Email/Password flow - the plugin's `requestInterceptor` automatically adds the Bearer token to all API requests.

## Key Components

### SwaggerAuthPlugin (`public/swagger-auth-plugin.js`)
- Custom JavaScript plugin loaded by Swagger UI
- Handles authentication UI (login form, Google button)
- Intercepts Basic Auth and converts to Bearer token
- Manages token storage and retrieval
- Adds Bearer token to all API requests via `requestInterceptor`

### GoogleOAuthSwaggerGuard (`src/auth/guards/google-oauth-swagger.guard.ts`)
- Dedicated guard for Swagger OAuth flow
- Overrides callback URL to point to Swagger-specific endpoint
- Ensures account selection prompt is shown

### AuthController Endpoints (`src/auth/auth.controller.ts`)
- `/api/auth/google/swagger` - Initiates OAuth flow
- `/api/auth/google/swagger-callback` - Handles OAuth callback, generates tokens, redirects to HTML page

### SwaggerAuthController (`src/swagger/swagger-auth.controller.ts`)
- `/api/docs/auth-callback` - Serves HTML page that delivers tokens to Swagger UI
- Extracts tokens from URL and sends them via `postMessage`

### SwaggerModule (`src/swagger/swagger.module.ts`)
- Organizes Swagger-related functionality
- Registers `SwaggerAuthController`

## Why Separate Endpoints?

The Swagger authentication flow uses dedicated endpoints separate from the main frontend flow:

1. **Different Callback Requirements**
   - Frontend: Redirects to frontend URL with tokens
   - Swagger: Needs backend-controlled HTML page to deliver tokens

2. **No Conditional Logic**
   - Avoids `if (state === 'swagger')` checks in main callback
   - Makes code more maintainable and explicit

3. **Follows NestJS Conventions**
   - Controllers in modules, not routes in `main.ts`
   - Clear separation of concerns

## Configuration Requirements

### Google OAuth Console
The callback URL `/api/auth/google/swagger-callback` must be registered as an authorized redirect URI in your Google OAuth console configuration.

**Example:**
- Development: `http://localhost:3010/api/auth/google/swagger-callback`
- Production: `https://api.yourdomain.com/api/auth/google/swagger-callback`

### Environment Variables
No special environment variables are required for Swagger authentication. It uses the same Google OAuth configuration as the main application:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL` (used for frontend, not Swagger)

## Token Management

### Storage
Tokens are stored in browser `localStorage`:
- `swagger_access_token` - JWT access token
- `swagger_refresh_token` - Refresh token (if available)
- `swagger_user_id` - User ID
- `swagger_user_email` - User email

### Token Usage
- Access token is automatically added to all `/api/*` requests via `requestInterceptor`
- Token is set in Swagger UI's internal state via `authActions.authorize()`
- Token persists across page refreshes (stored in `localStorage`)

### Logout
User can logout by clicking the logout button, which:
- Clears tokens from `localStorage`
- Clears Bearer token from Swagger UI
- Resets UI to logged-out state

## Error Handling

### Email/Password Authentication
- Invalid credentials → Plugin shows error message
- Network errors → Plugin shows error and allows retry
- Token storage failures → Error logged to console

### Google OAuth Authentication
- Popup blocked → Error message shown, button reset
- OAuth cancellation → Popup closes, button reset
- Authentication failure → Error passed via `postMessage`, shown in UI
- Network errors → Error message in popup, then closes

## Security Considerations

### Token Transmission
- Tokens are passed in URL query parameters for OAuth flow
- This is acceptable for Swagger UI (development tool)
- Tokens may appear in browser history/logs
- Production Swagger should be protected or disabled

### postMessage Security
- The HTML page sends `postMessage` with `'*'` origin
- The plugin validates origin in `messageHandler`:
  ```javascript
  if (event.origin !== window.location.origin) {
    return; // Reject messages from other origins
  }
  ```

### localStorage Security
- Tokens stored in `localStorage` are accessible to any script on the page
- This is acceptable for Swagger UI as it's a development tool
- Consider using `sessionStorage` for more security (tokens cleared on tab close)

## Related Files

- **Plugin**: `public/swagger-auth-plugin.js`
- **Guard**: `src/auth/guards/google-oauth-swagger.guard.ts`
- **Strategy**: `src/auth/strategies/google-oauth.strategy.ts`
- **Controller (Auth)**: `src/auth/auth.controller.ts`
- **Controller (Swagger)**: `src/swagger/swagger-auth.controller.ts`
- **Module**: `src/swagger/swagger.module.ts`
- **Main Setup**: `src/main.ts` (loads plugin)

## Comparison with Frontend Authentication

| Aspect | Frontend Flow | Swagger Flow |
|--------|--------------|--------------|
| **Initiation** | User navigates to `/login` | User clicks "Authorize" in Swagger |
| **OAuth Callback** | `/api/auth/google/callback` | `/api/auth/google/swagger-callback` |
| **Token Delivery** | Redirect to frontend URL | HTML page with `postMessage` |
| **Token Storage** | Frontend app state | Browser `localStorage` |
| **Token Usage** | Frontend HTTP client | Swagger UI `requestInterceptor` |

## Troubleshooting

### Google Sign-in Not Working
1. Check that `/api/auth/google/swagger-callback` is registered in Google OAuth console
2. Verify the callback URL matches exactly (including protocol and port)
3. Check browser console for errors
4. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly

### Tokens Not Being Added to Requests
1. Check browser console for plugin errors
2. Verify `swagger_access_token` exists in `localStorage`
3. Check that `requestInterceptor` is properly configured
4. Verify the plugin is loaded (check Network tab for `swagger-auth-plugin.js`)

### Popup Blocked
1. Browser may block popups - check browser settings
2. Ensure popup is opened from user interaction (button click)
3. Check browser console for popup blocking messages

## Future Enhancements

Potential improvements:
- Support for refresh token rotation
- Token expiration handling and auto-refresh
- Support for other OAuth providers (GitHub, Microsoft, etc.)
- Session timeout handling
- Remember me functionality

