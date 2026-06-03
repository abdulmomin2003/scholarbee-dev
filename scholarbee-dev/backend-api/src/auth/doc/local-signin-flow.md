# Local Signin Flow Documentation

This document explains the complete flow of local authentication (email/password login) in the ScholarBee backend.

## Overview

The local signin process follows a two-phase approach:
1. **Authentication Phase** (Strategy): Validates user credentials
2. **Authorization & Token Generation Phase** (Service): Generates JWT tokens and returns them

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Client Request: POST /auth/login                            │
│    Body: { email, password }                                    │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. LocalAuthenticationGuard (Interceptor)                      │
│    - Runs BEFORE controller method                             │
│    - Triggers LocalAuthenticationStrategy                      │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. LocalAuthenticationStrategy.validate()                      │
│    - Extracts email & password from request body               │
│    - Calls authService.validateUser()                          │
│    - Returns: SanitizedUser (NO TOKENS YET)                  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. AuthService.validateUser()                                  │
│    - Finds user by email                                        │
│    - Validates auth provider (must be Local)                   │
│    - Verifies password                                          │
│    - Sanitizes user (removes sensitive fields)                │
│    - Returns: SanitizedUser                                    │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Passport attaches user to request                          │
│    - Sets req.user = SanitizedUser                             │
│    - Guard allows request to proceed                           │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. AuthController.login() executes                            │
│    - Receives req.user (SanitizedUser from step 3)             │
│    - Calls authService.login(req.user, isAdminHost)            │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. AuthService.login()                                         │
│    - Validates admin access (if admin portal)                  │
│    - Gets app user context (includes computed fields)          │
│    - Generates JWT tokens ← TOKENS CREATED HERE                │
│    - Saves refresh token hash to database                      │
│    - Returns: { user, accessToken, refreshToken }              │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. Response sent to client                                     │
│    {                                                           │
│      user: AppUserContext,                                     │
│      accessToken: string,                                       │
│      refreshToken: string                                      │
│    }                                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Step-by-Step Explanation

### Step 1: Client Request
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Step 2: LocalAuthenticationGuard
**File**: `src/auth/guards/local-authentication.guard.ts`

The guard intercepts the request before it reaches the controller. It:
- Extends NestJS `AuthGuard` with Passport's local strategy
- Triggers the `LocalAuthenticationStrategy` automatically
- Blocks the request if authentication fails

```typescript
@Injectable()
export class LocalAuthenticationGuard extends AuthGuard(
  AuthStrategyEnum.LoginStrategy,
) {}
```

### Step 3: LocalAuthenticationStrategy.validate()
**File**: `src/auth/strategies/local-authentication.strategy.ts`

This is where credential validation happens:

```typescript
async validate(email: string, password: string) {
  const user = await this.authService.validateUser({
    email,
    password,
  });
  return user; // Returns SanitizedUser - NO TOKENS YET
}
```

**What happens:**
- Passport extracts `email` and `password` from request body (configured via `usernameField` and `passwordField`)
- Calls `authService.validateUser()` to verify credentials
- Returns `SanitizedUser` object (sensitive fields removed)
- **Important**: No tokens are generated here - only user validation

### Step 4: AuthService.validateUser()
**File**: `src/auth/auth.service.ts`

This method performs the actual credential validation:

```typescript
async validateUser(loginDto: LoginDto): Promise<SanitizedUser> {
  // 1. Find user by email
  const user = await this.usersService.findByEmail(loginDto.email);
  
  if (!user) {
    throw new NotFoundException('Invalid credentials');
  }

  // 2. Check auth provider (must be Local)
  if (user.authProvider && user.authProvider !== UserNS.AuthProvider.Local) {
    throw new UnauthorizedException('Use social login for this account');
  }

  // 3. Verify password
  const isMatch = await user.comparePassword(loginDto.password);
  if (!isMatch) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // 4. Sanitize user (remove password, hash, salt, etc.)
  const sanitizedUser = await this.usersService.sanitizeUser(user.toObject());
  
  return sanitizedUser; // Still NO TOKENS
}
```

**What it validates:**
- User exists
- Auth provider is Local (not OAuth)
- Password is correct
- Returns sanitized user (no sensitive data)

### Step 5: Passport Attaches User to Request
After successful validation:
- Passport attaches the returned `SanitizedUser` to `req.user`
- The guard allows the request to proceed to the controller
- The controller can now access `req.user`

### Step 6: AuthController.login()
**File**: `src/auth/auth.controller.ts`

The controller method finally executes:

```typescript
@UseGuards(LocalAuthenticationGuard)
@Post('login')
async login(@LoginReq() req: LoginRequest) {
  // req.user contains the SanitizedUser from step 3
  const isAdminHost = this.requestContextService.getIsAdminHost();
  return this.authService.login(req.user, isAdminHost); // ← TOKENS GENERATED HERE
}
```

**What happens:**
- `@LoginReq()` decorator extracts `req.user` (validated by guard)
- Determines if this is an admin portal request
- Calls `authService.login()` with the validated user
- **This is where tokens are generated**

### Step 7: AuthService.login() - Token Generation
**File**: `src/auth/auth.service.ts`

This is where JWT tokens are created:

```typescript
async login(user: SanitizedUser, requireAdminValidation: boolean = false) {
  // 1. Admin validation (if admin portal)
  if (requireAdminValidation) {
    // Validates user is admin with valid campus_id
  }

  // 2. Get app user context (includes computed fields like is_primary_campus_admin)
  const appUserContext = await this.usersService.getAppUserContext(user);
  
  // 3. Generate JWT tokens ← TOKENS CREATED HERE
  const { accessToken, refreshToken } = 
    await this.generateAuthTokens(appUserContext);
  
  // 4. Hash and save refresh token to database
  const refreshTokenHash = HashingUtils.hashToken(refreshToken);
  await this.usersService.update(user._id.toString(), { refreshTokenHash });
  
  // 5. Return tokens + user context
  return {
    user: appUserContext,
    accessToken,
    refreshToken,
  };
}
```

**What happens:**
1. **Admin Validation**: If accessing admin portal, validates admin permissions
2. **Get App User Context**: Enriches user with computed fields (e.g., `is_primary_campus_admin`, `university_id`)
3. **Generate Tokens**: Creates JWT access and refresh tokens
4. **Save Refresh Token**: Stores hashed refresh token in database
5. **Return Response**: Returns user context and both tokens

### Step 8: Response to Client
The client receives:

```json
{
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "Admin",
    "campus_id": "campus_id",
    "is_primary_campus_admin": true,
    "university_id": "university_id",
    // ... other fields
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Key Concepts

### Why Tokens Aren't in the Strategy

The strategy (`LocalAuthenticationStrategy`) only handles **authentication** (verifying who you are). It:
- Validates credentials
- Returns the user object
- Does NOT generate tokens

Token generation happens in the **service layer** (`AuthService.login()`), which handles:
- Authorization (what you can do)
- Token creation
- Token storage

### Separation of Concerns

This architecture separates:

1. **Authentication** (Strategy)
   - "Who are you?"
   - Validates credentials
   - Returns user identity

2. **Authorization & Token Management** (Service)
   - "What can you do?"
   - Generates tokens
   - Manages token lifecycle
   - Handles admin validation

### Request Flow Summary

```
Request → Guard → Strategy (validate credentials) 
  → Service.validateUser() → Returns SanitizedUser 
  → Attached to req.user → Controller 
  → Service.login() → Generate tokens 
  → Return tokens to client
```

## Related Files

- **Guard**: `src/auth/guards/local-authentication.guard.ts`
- **Strategy**: `src/auth/strategies/local-authentication.strategy.ts`
- **Controller**: `src/auth/auth.controller.ts`
- **Service**: `src/auth/auth.service.ts`
- **Decorator**: `src/auth/decorators/auth-req.decorator.ts`
- **Types**: `src/auth/types/auth.interface.ts`

## Error Handling

At each step, errors can occur:

1. **Strategy Level**: Invalid credentials → `UnauthorizedException`
2. **Service.validateUser()**: 
   - User not found → `NotFoundException`
   - Wrong auth provider → `UnauthorizedException`
   - Invalid password → `UnauthorizedException`
3. **Service.login()**:
   - Admin validation failed → `UnauthorizedException`
   - Token generation errors → Internal server errors

All errors are properly handled and return appropriate HTTP status codes.

