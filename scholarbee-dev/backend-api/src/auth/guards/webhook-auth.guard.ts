import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IConfiguration } from 'src/config/configuration';

@Injectable()
export class WebhookAuthGuard implements CanActivate {
  private readonly logger = new Logger(WebhookAuthGuard.name);

  constructor(private readonly configService: ConfigService<IConfiguration>) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Get webhook configuration from config service
    const webhookSecret = this.configService.get('webhook.secret', {
      infer: true,
    });
    // const webhookApiKey = this.configService.get<string>('webhook.apiKey', {
    //   infer: true,
    // });
    // const webhookBearerToken = this.configService.get<string>(
    //   'webhook.bearerToken',
    // );

    // // Method 1: API Key in Header
    // const apiKey = request.headers['x-api-key'] as string;
    // if (apiKey && webhookApiKey && apiKey === webhookApiKey) {
    //   this.logger.log('Webhook authenticated via API key');
    //   return true;
    // }

    // Method 2: Webhook Secret in Header
    const requestWebhookSecret = request.headers['x-webhook-secret'] as string;
    if (
      requestWebhookSecret &&
      webhookSecret &&
      requestWebhookSecret === webhookSecret
    ) {
      this.logger.log('Webhook authenticated via webhook secret');
      return true;
    }

    // // Method 3: Bearer Token
    // const authHeader = request.headers.authorization;
    // if (authHeader && authHeader.startsWith('Bearer ')) {
    //   const token = authHeader.substring(7);
    //   if (webhookBearerToken && token === webhookBearerToken) {
    //     this.logger.log('Webhook authenticated via Bearer token');
    //     return true;
    //   }
    // }

    this.logger.error('Invalid webhook authentication');
    throw new UnauthorizedException('Invalid webhook authentication');
  }
}
