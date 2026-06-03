import { Module } from '@nestjs/common';
import { EmailTemplateService } from './services/email-template.service';
import { TemplateRendererService } from './services/template-renderer.service';

@Module({
  providers: [EmailTemplateService, TemplateRendererService],
  exports: [EmailTemplateService, TemplateRendererService],
})
export class EmailTemplatesModule {}
