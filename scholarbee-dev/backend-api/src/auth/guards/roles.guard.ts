import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * @deprecated Checks `request.user.roles`, which is not set on JWT payloads from `generateAuthTokens`.
 * Authenticated users only have `user_type` (e.g. `Admin`, `Super_Admin`, `Student`). This guard
 * will deny access even for valid admins unless `roles` is populated elsewhere.
 *
 * Use {@link AllowedUserTypesGuard} with {@link AllowedUserTypes} instead.
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        return requiredRoles.some((role) => user.roles?.includes(role));
    }
} 