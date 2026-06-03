import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Handlebars from 'handlebars';
import {
  RenderedEmail,
  TemplateDataForId,
  TemplateId,
} from '../types/template.types';
import { EmailTemplateService } from './email-template.service';
import { IConfiguration } from 'src/config/configuration';

@Injectable()
export class TemplateRendererService {
  constructor(
    private readonly templateService: EmailTemplateService,
    private readonly configService: ConfigService<IConfiguration>,
  ) {
    this.registerHandlebarsHelpers();
  }

  /**
   * Render template with dynamic data using Handlebars (typed version)
   * @param templateId The template ID (must be a valid TemplateId)
   * @param data The data object matching the template's expected type
   */

  async renderTemplate<T extends TemplateId>(
    templateId: T,
    data: TemplateDataForId<T>,
  ): Promise<RenderedEmail> {
    const template = await this.templateService.getTemplate(templateId);

    // logoUrl is injected automatically so templates never hardcode a storage domain.
    // gcsBucketPath is always defined (GCS_BUCKET is a required env var).
    // logoAssetPath is optional — falls back to the known production asset URL when absent.
    const gcsBucketPath = this.configService.get('gcs.bucketPath', { infer: true })!;
    const logoAssetRelativePath = this.configService.get('gcs.logoAssetRelativePath', { infer: true });
    const logoUrl = `${gcsBucketPath}/${logoAssetRelativePath.replace(/^\/+/, '')}`;
    const supportEmail =
      this.configService.get('support.email', { infer: true }) ?? 'info@scholarbee.pk';
    const supportPhone =
      this.configService.get('support.phone', { infer: true }) ?? '+92 325 555 9699';
    const supportPhoneTel = supportPhone.replace(/[^\d+]/g, '');

    const context = {
      ...data,
      logoUrl,
      supportEmail,
      supportPhone,
      supportPhoneTel,
    };

    // Compile subject template
    const subjectTemplate = Handlebars.compile(template.subject);
    const subject = subjectTemplate(context);

    // Compile HTML content template
    const htmlTemplate = Handlebars.compile(template.htmlContent);
    const html = htmlTemplate(context);

    return {
      subject,
      html,
      text: this.htmlToText(html),
    };
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHandlebarsHelpers(): void {
    // Helper for formatting dates
    Handlebars.registerHelper('formatDate', (date: Date, format: string) => {
      if (!date) return '';

      const d = new Date(date);
      switch (format) {
        case 'short':
          return d.toLocaleDateString();
        case 'long':
          return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        default:
          return d.toISOString();
      }
    });

    // Helper for capitalizing text
    Handlebars.registerHelper('capitalize', (text: string) => {
      if (!text) return '';
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    });

    // Helper for conditional text based on status
    Handlebars.registerHelper('statusText', (status: string) => {
      switch (status?.toLowerCase()) {
        case 'approved':
          return 'approved';
        case 'rejected':
          return 'not approved';
        case 'under_review':
          return 'under review';
        default:
          return status;
      }
    });

    // Helper for generating application URLs
    Handlebars.registerHelper(
      'applicationUrl',
      (_applicationId: string, _path: string = '') => {
        const baseUrl = this.configService.get('frontend.url', {
          infer: true,
        });
        return baseUrl;
      },
    );
  }

  /**
   * Convert HTML to plain text (basic implementation)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}
