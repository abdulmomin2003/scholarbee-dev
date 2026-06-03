import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * @deprecated Pair with {@link RolesGuard} only if `request.user.roles` is populated (it is not
 * for standard login tokens). Prefer {@link AllowedUserTypes} + {@link AllowedUserTypesGuard}.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles); 