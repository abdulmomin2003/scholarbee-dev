import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { RefreshAuthenticationStrategy } from 'src/auth/strategies/refresh-authentication.strategy';
import { IConfiguration } from 'src/config/configuration';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { ChatModule } from 'src/chat/chat.module';
import { ReferenceSystemModule } from '../reference-system/reference-system.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerifiedGuard } from './guards/email-verified.guard';
import { GoogleOAuthSwaggerGuard } from './guards/google-oauth-swagger.guard';
import { LocalAuthenticationGuard } from './guards/local-authentication.guard';
import { OptionalAuthGuard } from './guards/optional-auth.guard';
import { ResourceProtectionGuard } from './guards/resource-protection.guard';
import { WebhookAuthGuard } from './guards/webhook-auth.guard';
import { WebhookRateLimitGuard } from './guards/webhook-rate-limit.guard';
import { GoogleOAuthStrategy } from './strategies/google-oauth.strategy';
import { LocalAuthenticationStrategy } from './strategies/local-authentication.strategy';
import { OptionalAuthStrategy } from './strategies/optional-auth.strategy';
import { ResourceProtectionStrategy } from './strategies/resource-protection.strategy';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => ChatModule),
    ReferenceSystemModule,
    PassportModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IConfiguration>) => ({
        secret: configService.get('jwt.loginSecret', { infer: true }),
        signOptions: {
          expiresIn: `${configService.get('jwt.loginExpiration', { infer: true })}s`,
        }, // Access token expires in 15 minutes
      }),
    }),
  ],
  providers: [
    AuthService,
    ResourceProtectionStrategy,
    LocalAuthenticationStrategy,
    RefreshAuthenticationStrategy,
    OptionalAuthStrategy,
    GoogleOAuthStrategy,

    LocalAuthenticationGuard,
    ResourceProtectionGuard,
    OptionalAuthGuard,
    WebhookAuthGuard,
    WebhookRateLimitGuard,
    GoogleOAuthSwaggerGuard,
    EmailVerifiedGuard,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    JwtModule,
    OptionalAuthGuard,
    WebhookAuthGuard,
    WebhookRateLimitGuard,
  ],
})
export class AuthModule { }
