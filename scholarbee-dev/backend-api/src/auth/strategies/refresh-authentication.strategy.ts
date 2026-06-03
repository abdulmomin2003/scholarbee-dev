import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from 'src/auth/auth.service';
import { AuthStrategyEnum } from 'src/auth/strategies/strategy.enum';
import { RefreshTokenPayload } from 'src/auth/types/auth.interface';
import { IConfiguration } from 'src/config/configuration';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RefreshAuthenticationStrategy extends PassportStrategy(
  Strategy,
  AuthStrategyEnum.RefreshStrategy,
) {
  constructor(
    private configService: ConfigService<IConfiguration>,
    private authService: AuthService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('jwt.refreshSecret', { infer: true }),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: RefreshTokenPayload) {
    const refreshToken = req.headers.authorization?.replace('Bearer ', '');

    console.log('🔄 RefreshAuthenticationStrategy.validate called:', {
      hasPayload: !!payload,
      userId: payload?.userId,
      hasAuthHeader: !!req.headers.authorization,
      authHeaderValue: req.headers.authorization
        ? req.headers.authorization.substring(0, 20) + '...'
        : 'undefined',
      tokenLength: refreshToken?.length,
      tokenStart: refreshToken?.substring(0, 50) + '...',
      tokenEnd: '...' + refreshToken?.substring(refreshToken.length - 20),
      timestamp: new Date().toISOString(),
    });

    if (!refreshToken) {
      console.log('❌ No refresh token found in authorization header');
      throw new UnauthorizedException('No refresh token provided');
    }

    console.log('✅ Refresh token extracted, proceeding with validation');

    try {
      // Verify the refresh token
      const result = await this.authService.validateRefreshToken(
        payload.userId,
        refreshToken,
      );
      console.log('✅ Refresh token validation successful:', {
        userId: result?._id,
        email: result.email,
        timestamp: new Date().toISOString(),
      });
      return result;
    } catch (error) {
      console.log('❌ Refresh token validation failed:', {
        error: error.message,
        errorType: error.constructor?.name,
        userId: payload?.userId,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }
}
