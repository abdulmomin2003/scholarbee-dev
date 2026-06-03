import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategyEnum } from 'src/auth/strategies/strategy.enum';
import { AUTH_ERROR_CODE } from '../enums/error-code.enum';

@Injectable()
export class RefreshAuthenticationGuard extends AuthGuard(
  AuthStrategyEnum.RefreshStrategy,
) {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context) {
    // Enhanced logging for debugging
    console.warn('🔍 RefreshAuthenticationGuard Debug Info:', {
      hasError: !!err,
      hasUser: !!user,
      hasInfo: !!info,
      infoType: info ? typeof info : 'undefined',
      infoConstructor: info ? info.constructor?.name : 'undefined',
      errorMessage: err?.message || 'No error',
      userExists: !!user,
      timestamp: new Date().toISOString(),
    });

    // Log the full info object structure for debugging
    if (info) {
      console.log('📋 Info Object Details:', {
        keys: Object.keys(info),
        message: info.message,
        name: info.name,
        stack: info.stack,
        fullObject: JSON.stringify(info, null, 2),
      });
    } else {
      console.log(
        '⚠️ Info object is undefined/null - this is the problematic case',
      );
    }

    // check if the user is authenticated
    if (err || !user) {
      console.log('🚨 Authentication failed - processing error:', {
        error: err?.message || 'No error provided',
        userExists: !!user,
        infoExists: !!info,
        infoMessage: info?.message || 'No message in info',
      });

      // check if the token is not found - with safe property access
      if (info && info.message === 'No auth token') {
        console.log('🔑 No auth token detected');
        throw new UnauthorizedException(
          AUTH_ERROR_CODE.TOKEN_NOT_FOUND,
          'Token not found in the request',
        );
      } else if (info instanceof JsonWebTokenError) {
        // check if info is an instance of Error
        if (info instanceof TokenExpiredError) {
          throw new UnauthorizedException(
            AUTH_ERROR_CODE.TOKEN_EXPIRED,
            'Token expired',
          );
        } else if (info.message.includes('malformed')) {
          throw new UnauthorizedException(
            AUTH_ERROR_CODE.TOKEN_MALFORMED,
            'Token malformed',
          );
        } else if (info.message.includes('invalid signature')) {
          throw new UnauthorizedException(
            AUTH_ERROR_CODE.TOKEN_INVALID_SIGNATURE,
            'Invalid signature; Ensure that correct token is used',
          );
        }
      }

      // Handle case where info is undefined but we have an error (like invalid refresh token)
      if (!info && err) {
        console.log(
          '🚨 Error without info object - likely invalid refresh token:',
          {
            errorMessage: err.message,
            errorType: err.constructor?.name,
          },
        );

        if (err.message === 'Invalid refresh token') {
          throw new UnauthorizedException(
            AUTH_ERROR_CODE.TOKEN_INVALID_SIGNATURE,
            'Invalid refresh token - please use the latest refresh token',
          );
        }
      }

      throw err || new UnauthorizedException('Authentication required');
    }

    return user;
  }
}
