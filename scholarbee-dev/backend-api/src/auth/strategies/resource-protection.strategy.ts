import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthStrategyEnum } from 'src/auth/strategies/strategy.enum';
import { AccessTokenPayload, AccessTokenPayloadWithObjectId } from 'src/auth/types/auth.interface';
import { IConfiguration } from 'src/config/configuration';
import { IAppUserContext } from 'src/users/schemas/user.types';
import { stringToObjectId } from 'src/utils/db.utils';

@Injectable()
export class ResourceProtectionStrategy extends PassportStrategy(
  Strategy,
  AuthStrategyEnum.ResourceProtectionStrategy,
) {
  constructor(private configService: ConfigService<IConfiguration>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.loginSecret', { infer: true }),
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AccessTokenPayloadWithObjectId> {
    const { campus_id, university_id, ...restPayload } = payload;

    return {
      ...restPayload,
      ...(campus_id?.toString() && { campus_id: stringToObjectId(campus_id?.toString()) }),
      ...(university_id?.toString() && { university_id: stringToObjectId(university_id?.toString()) }),
    };

  }
}