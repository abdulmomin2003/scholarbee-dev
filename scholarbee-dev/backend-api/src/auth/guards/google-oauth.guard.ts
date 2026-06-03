import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import { AuthStrategyEnum } from 'src/auth/strategies/strategy.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard(AuthStrategyEnum.GoogleStrategy) {
    constructor(private readonly configService: ConfigService) {
        super();
    }

    getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions {
        const req = context.switchToHttp().getRequest();
        
        // Get state parameter from query string (for Swagger detection)
        const state = req.query?.state as string;
        
        const options: IAuthModuleOptions = {
            // This is required to force Google to show the "Select Account" dialog before login
            prompt: 'select_account',
        };
        
        // Pass state parameter if provided (for Swagger callback routing)
        if (state) {
            options.state = state;
        }
        
        return options;
    }

    // This captures any errors from the GoogleOAuthStrategy and stashes them on the request
    // so the controller can centralize redirect behavior.
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        if (err || info) {
            console.error('❌ GoogleOAuthGuard authentication failed:', { err, info });
        }
        if (err) {
            req.oauthError = err;
        } else if (info) {
            req.oauthError = info;
        }

        // Return user or null; do not throw, so controller can decide how to respond
        return user || null;
    }
}


