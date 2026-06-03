import { createParamDecorator, ExecutionContext, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  AuthenticatedRequest,
  CampusAdminAuthenticatedRequest,
  LoginRequest,
  OptionalAuthenticatedRequest,
} from 'src/auth/types/auth.interface';
import { UserNS } from 'src/users/schemas/user.schema';


/**
 * This decorator is used to get the user object from the request.
 * This assumes that the route is protected by the LocalAuthenticationGuard.
 * Therefore, the user object is always expected to be present in the request. Otherwise, it will throw a BadRequestException. (Which should never happen for routes protected by the LocalAuthenticationGuard)
 */
export const LoginReq = createParamDecorator<
  undefined,
  ExecutionContext,
  LoginRequest
>((_data, ctx) => {
  const loginRequest = ctx.switchToHttp().getRequest<LoginRequest>();
  if (!loginRequest.user) {
    throw new BadRequestException(
      'User object not found in request. Please ensure that the route is protected by the ResourceProtectionGuard.',
    );
  }
  return loginRequest;
});


/**
 * This decorator is used to get the user object from the request.
 * This assumes that the route is protected by the ResourceProtectionGuard.
 * Therefore, the user object is always expected to be present in the request. Otherwise, it will throw a BadRequestException. (Which should never happen for routes protected by the ResourceProtectionGuard)
 * 
 * @param userType - Optional user type to validate. If provided, validates that the user has the specified user_type.
 *                   For Campus_Admin, performs three validations:
 *                   1. user_type must be Campus_Admin
 *                   2. campus_id must exist
 *                   3. campus_id must be a valid ObjectId
 * 
 * @example
 * // Standard authenticated request
 * @AuthReq() authReq: AuthenticatedRequest
 * 
 * @example
 * // Campus admin validated request (ensures user_type is Campus_Admin, campus_id exists and is valid ObjectId)
 * @AuthReq(UserNS.UserType.Campus_Admin) authReq: CampusAdminAuthenticatedRequest
 * 
 * @example
 * // Super admin validated request
 * @AuthReq(UserNS.UserType.Super_Admin) authReq: AuthenticatedRequest
 */
export function AuthReq(): ParameterDecorator;
export function AuthReq(userType: UserNS.UserType.Campus_Admin): ParameterDecorator;
export function AuthReq(userType: UserNS.UserType): ParameterDecorator;
export function AuthReq(userType?: UserNS.UserType): ParameterDecorator {
  return createParamDecorator<UserNS.UserType | undefined, ExecutionContext, AuthenticatedRequest | CampusAdminAuthenticatedRequest>(
    (data, ctx) => {
      const authRequest = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
      if (!authRequest.user) {
        throw new BadRequestException('User object not found in request. Please ensure that the route is protected by the ResourceProtectionGuard.');
      }

      // If user type validation is requested
      if (data !== undefined) {
        // Check 1: Validate user_type matches the requested type
        if (authRequest.user.user_type !== data) {
          throw new ForbiddenException(
            `Access denied. This endpoint requires ${data} privileges.`,
          );
        }

        // For Campus_Admin, perform additional validations
        if (data === UserNS.UserType.Campus_Admin) {
          // Check 1: Explicitly ensure user_type is Campus_Admin (defensive check)
          if (authRequest.user.user_type !== UserNS.UserType.Campus_Admin) {
            throw new ForbiddenException(
              'Access denied. This endpoint requires Campus Admin privileges.',
            );
          }

          // Check 2: Validate that campus_id exists
          if (!authRequest.user.campus_id) {
            throw new ForbiddenException(
              'Campus admin must have a valid campus_id to access this resource.',
            );
          }

          // Check 3: Validate that campus_id is a valid ObjectId
          const campusId = authRequest.user.campus_id;
          const campusIdString = campusId instanceof Types.ObjectId
            ? campusId.toString()
            : String(campusId);

          if (!Types.ObjectId.isValid(campusIdString)) {
            throw new ForbiddenException(
              'Campus admin must have a valid campus_id (ObjectId) to access this resource.',
            );
          }

          // TypeScript will narrow the type to CampusAdminAuthenticatedRequest
          return authRequest as CampusAdminAuthenticatedRequest;
        }
      }

      return authRequest;
    }
  )(userType);
}


/**
 * This decorator is used to get the user object from the request.
 * This assumes that the route is protected by the OptionalAuthGuard.
 * The user object may be present (if authenticated) or null (if not authenticated).
 * This decorator never throws an exception, as optional authentication is designed to work with or without user data.
 */
export const OptionalAuthReq = createParamDecorator<
  undefined,
  ExecutionContext,
  OptionalAuthenticatedRequest
>((_data, ctx) => {
  const optionalAuthRequest = ctx.switchToHttp().getRequest<OptionalAuthenticatedRequest>();
  return optionalAuthRequest;
});

// TODO: RefreshReq