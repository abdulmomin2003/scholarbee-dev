import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserNS } from '../../users/schemas/user.schema';
import { ALLOWED_USER_TYPES_KEY } from '../decorators/allowed-user-types.decorator';

@Injectable()
export class AllowedUserTypesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const allowedUserTypes = this.reflector.getAllAndOverride<
      UserNS.UserType[]
    >(ALLOWED_USER_TYPES_KEY, [context.getHandler(), context.getClass()]);

    // If no user types are specified, allow all authenticated users
    if (!allowedUserTypes || allowedUserTypes.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Check if user exists and has user_type
    if (!user || !user.user_type) {
      throw new ForbiddenException('User type not found');
    }

    // Check if user's user_type matches any of the allowed types
    const hasAllowedUserType = allowedUserTypes.includes(user.user_type);

    if (!hasAllowedUserType) {
      throw new ForbiddenException(
        `Access denied. Required user types: ${allowedUserTypes.join(', ')}`,
      );
    }

    // For Campus_Admin, ensure campus_id is present
    if (user.user_type === UserNS.UserType.Campus_Admin && !user.campus_id) {
      throw new ForbiddenException(
        'Campus admin must have a valid campus_id to access this resource',
      );
    }

    return true;
  }
}

