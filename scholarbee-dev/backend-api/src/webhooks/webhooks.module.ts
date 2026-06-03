import { Module } from '@nestjs/common';
import { WebhookController } from './controllers/webhook.controller';
import { WebhookHandlerService } from './services/webhook-handler.service';
import { NotificationModule } from '../notification/notification.module';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';

/**
 * Webhooks module for handling all webhook-related functionality
 * This module provides a centralized way to handle incoming webhooks
 * and can be extended to support outgoing webhooks in the future
 */
@Module({
  imports: [NotificationModule, ElasticsearchModule], // Added ElasticsearchModule for ES operations
  controllers: [WebhookController],
  providers: [WebhookHandlerService],
  exports: [WebhookHandlerService],
})
export class WebhooksModule {}
