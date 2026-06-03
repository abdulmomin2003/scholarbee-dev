import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthStrategyEnum } from 'src/auth/strategies/strategy.enum';
import { AccessTokenPayload } from 'src/auth/types/auth.interface';
import { IConfiguration } from 'src/config/configuration';

@Injectable()
export class OptionalAuthStrategy extends PassportStrategy(
    Strategy,
    AuthStrategyEnum.OptionalAuthStrategy,
) {
    constructor(private configService: ConfigService<IConfiguration>) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('jwt.loginSecret', { infer: true }),
            // passReqToCallback: true, // setting this to true will cause the `request` to be passed to the validate function as the first argument
        });
    }

    async validate(payload: AccessTokenPayload) {
        // If we have a valid payload, return it
        if (payload) {
            return payload;
        }
        // If no payload (no token or invalid token), return null
        // This allows the endpoint to continue without authentication
        return null;
    }
}
