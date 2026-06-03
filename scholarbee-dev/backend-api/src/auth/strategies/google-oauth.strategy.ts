import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { IConfiguration } from 'src/config/configuration';
import { AuthService } from '../auth.service';
import { AuthStrategyEnum } from './strategy.enum';

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(
    Strategy,
    AuthStrategyEnum.GoogleStrategy,
) {
    constructor(
        private readonly configService: ConfigService<IConfiguration>,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: configService.get('google.clientId', { infer: true }),
            clientSecret: configService.get('google.clientSecret', { infer: true }),
            callbackURL: configService.get('google.callbackUrl', { infer: true }),
            scope: ['profile', 'email'],
            passReqToCallback: false,
        });
    }

    // This is required to force Google to show the "Select Account" dialog before login; Otherwise, it will automatically select the first account and redirect to the callback URL; which might cause UX issue causing the user to think that he's auto logged in;
    authorizationParams(options: any) {
        const params: any = {
            prompt: 'select_account',
        };

        // Preserve state parameter if provided (for Swagger callback detection)
        // The state is passed from GoogleOAuthGuard.getAuthenticateOptions()
        if (options?.state) {
            params.state = options.state;
        }

        return params;
    }

    /**
     * Whatever is returned from this function is automatically added to the request object as `req.user` received by the controller which uses the GoogleOAuthGuard.
     */
    async validate(
        // ! Do not use these to send to the frontend as they are not the actual access and refresh tokens from our backend; Use the ones from the response of the login endpoint instead;
        googleAccessToken: string,
        googleRefreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ) {

        try {
            const user = await this.authService.validateGoogleUser({
                googleId: profile.id,
                email: profile.emails?.[0]?.value,
                fullName: profile.displayName,
                firstName: profile.name?.givenName,
                lastName: profile.name?.familyName,
                profileImageUrl: profile.photos?.[0]?.value,
            });
            return done(null, user);
        } catch (err) {
            console.error('❌ GoogleOAuthStrategy validation failed:', err);
            return done(err, false);
        }
    }

}