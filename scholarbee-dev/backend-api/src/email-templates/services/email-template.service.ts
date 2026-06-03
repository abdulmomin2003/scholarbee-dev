import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { EmailTemplate, RenderedEmail } from '../types/template.types';

@Injectable()
export class EmailTemplateService {
  private readonly templatesPath = join(
    process.cwd(),
    'templates',
    'email-templates',
  );

  /**
   * Get template content by ID
   */
  async getTemplate(templateId: string): Promise<EmailTemplate> {
    const templatePath = join(this.templatesPath, `${templateId}.html`);
    try {
      const content = readFileSync(templatePath, 'utf-8');

      // Extract template metadata from HTML comments
      const metadata = this.extractTemplateMetadata(content);

      return {
        id: templateId,
        name: metadata.name || templateId,
        subject: metadata.subject || 'ScholarBee Notification',
        htmlContent: content,
        variables: metadata.variables || [],
        category: metadata.category || 'general',
      };
    } catch (error) {
      throw new Error(`Template not found: ${templateId} at path: "${templatePath}"`);
    }
  }

  /**
   * Extract template metadata from HTML comments
   * Format: <!-- TEMPLATE: {metadata} -->
   */
  private extractTemplateMetadata(content: string): any {
    const metadataMatch = content.match(/<!-- TEMPLATE: ({[\s\S]*?}) -->/);
    if (metadataMatch) {
      try {
        return JSON.parse(metadataMatch[1]);
      } catch (error) {
        console.warn('Invalid template metadata format');
      }
    }
    return {};
  }

  /**
   * Get all available templates
   */
  async getAllTemplates(): Promise<EmailTemplate[]> {
    // This could be enhanced to scan the templates directory
    // For now, return a predefined list
    const templateIds = [
      'application-status/under-review',
      'application-status/approved',
      'application-status/rejected',
    ];

    const templates: EmailTemplate[] = [];
    for (const templateId of templateIds) {
      try {
        const template = await this.getTemplate(templateId);
        templates.push(template);
      } catch (error) {
        console.warn(`Template ${templateId} not found`);
      }
    }

    return templates;
  }
}
