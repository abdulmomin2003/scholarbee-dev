import {
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategyEnum } from 'src/auth/strategies/strategy.enum';

/**
 * This guard is used for endpoints that can work with or without authentication.
 * It will extract user information from JWT tokens when present, but won't fail
 * if no token is provided or if the token is invalid.
 * 
 * This is useful for public endpoints that need to show user-specific data
 * (like favorites) when the user is authenticated, but still work for anonymous users.
 */
@Injectable()
export class OptionalAuthGuard extends AuthGuard(
    AuthStrategyEnum.OptionalAuthStrategy,
) {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

    handleRequest(err, user, info, context) {
        // Always return the user (which might be null if no valid token)
        // This allows the endpoint to continue regardless of authentication status
        return user || null;
    }
}
