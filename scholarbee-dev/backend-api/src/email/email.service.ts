import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { IConfiguration } from 'src/config/configuration';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly apiKey: string;
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService<IConfiguration>) {
    this.apiKey = this.configService.get('email.resendApiKey', { infer: true }) ?? '';
    this.defaultFrom =
      this.configService.get('email.defaultFromEmail', { infer: true }) ?? 'noreply@scholarbee.pk';
    this.resend = new Resend(this.apiKey);
  }

  async send(options: EmailOptions): Promise<void> {
    const from = options.from || this.defaultFrom;

    if (!this.apiKey) {
      this.logger.warn(`Skipping email to ${options.to} — no Resend API key configured`);
      return;
    }

    try {
      await this.resend.emails.send({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
      throw error;
    }
  }
}
