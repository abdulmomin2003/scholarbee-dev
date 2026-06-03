import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { WebhookAuthGuard } from '../../auth/guards/webhook-auth.guard';
import { WebhookRateLimitGuard } from '../../auth/guards/webhook-rate-limit.guard';
import { WebhookHandlerService } from '../services/webhook-handler.service';
import { AdmissionProgramNotificationWebhookDto, ScholarshipNotificationWebhookDto } from '../dto/notification-webhook.dto';
import { AdmissionProgramIndexingWebhookDto } from '../dto/admission-program-indexing-webhook.dto';
import { ApiTags } from '@nestjs/swagger';
import { AdmissionProgramNotificationWebhookApiDoc } from '../api-docs/admission-program-notification-webhook.api-doc';
import { ScholarshipNotificationWebhookApiDoc } from '../api-docs/scholarship-notification-webhook.api-doc';
import { AdmissionProgramIndexingWebhookApiDoc } from '../api-docs/admission-program-indexing-webhook.api-doc';

/**
 * Main controller for handling webhook requests
 * Currently handles notification webhooks and admission program indexing webhooks
 */
@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookHandlerService: WebhookHandlerService) { }

  /**
   * Handle admission program creation notification webhooks
   * Route: POST /webhooks/notifications/admission-program-created
   */
  @AdmissionProgramNotificationWebhookApiDoc()
  @Post('notifications/admission-program-created')
  @UseGuards(WebhookAuthGuard, WebhookRateLimitGuard)
  async handleAdmissionProgramCreationNotificationWebhook(
    @Body() webhookData: AdmissionProgramNotificationWebhookDto,
  ) {
    this.logger.log(`Received admission program creation notification webhook request`);

    try {
      // Process the notification using the webhook handler service
      const result =
        await this.webhookHandlerService.handleAdmissionProgramNotificationWebhook(webhookData);

      this.logger.log('Admission program notification webhook processed successfully');
      return result;
    } catch (error) {
      this.logger.error('Failed to process admission program notification webhook', error.stack);
      throw error;
    }
  }

  /**
   * Handle scholarship creation notification webhooks
   * Route: POST /webhooks/notifications/scholarship-created
   */
  @ScholarshipNotificationWebhookApiDoc()
  @Post('notifications/scholarship-created')
  @UseGuards(WebhookAuthGuard, WebhookRateLimitGuard)
  async handleScholarshipCreationNotificationWebhook(
    @Body() webhookData: ScholarshipNotificationWebhookDto,
  ) {
    this.logger.log(`Received scholarship creation notification webhook request`);

    try {
      // Process the notification using the webhook handler service
      const result =
        await this.webhookHandlerService.handleScholarshipNotificationWebhook(webhookData);

      this.logger.log('Scholarship notification webhook processed successfully');
      return result;
    } catch (error) {
      this.logger.error('Failed to process scholarship notification webhook', error.stack);
      throw error;
    }
  }

  /**
   * Handle admission program indexing webhooks
   * Route: POST /webhooks/admission-program-indexing
   * This endpoint indexes admission program data to Elasticsearch
   */
  @AdmissionProgramIndexingWebhookApiDoc()
  @Post('admission-program-indexing')
  @UseGuards(WebhookAuthGuard, WebhookRateLimitGuard)
  async handleAdmissionProgramIndexingWebhook(
    @Body() webhookData: AdmissionProgramIndexingWebhookDto,
  ) {
    this.logger.log(`Received admission program indexing webhook request`);

    try {
      // Process the indexing using the webhook handler service
      const result =
        await this.webhookHandlerService.handleAdmissionProgramIndexingWebhook(
          webhookData,
        );

      this.logger.log(
        'Admission program indexing webhook processed successfully',
      );
      return result;
    } catch (error) {
      this.logger.error(
        'Failed to process admission program indexing webhook',
        error.stack,
      );
      throw error;
    }
  }
}
