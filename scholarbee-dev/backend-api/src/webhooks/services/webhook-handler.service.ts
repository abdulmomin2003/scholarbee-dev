import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AdmissionProgramNotificationService } from '../../notification/services/admission-program-notification.service';
import { ScholarshipNotificationService } from '../../notification/services/scholarship-notification.service';
import { AdmissionProgramNotificationWebhookDto, ScholarshipNotificationWebhookDto } from '../dto/notification-webhook.dto';
import { AdmissionProgramIndexingWebhookDto } from '../dto/admission-program-indexing-webhook.dto';
import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service';
import { ConfigService } from '@nestjs/config';

/**
 * Main service for handling webhook requests
 * Currently handles notification webhooks and admission program indexing webhooks
 */
@Injectable()
export class WebhookHandlerService {
  private readonly logger = new Logger(WebhookHandlerService.name);

  constructor(
    private readonly admissionNotificationService: AdmissionProgramNotificationService,
    private readonly scholarshipNotificationService: ScholarshipNotificationService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Handle admission program notification webhooks
   */
  async handleAdmissionProgramNotificationWebhook(
    webhookData: AdmissionProgramNotificationWebhookDto,
  ) {
    try {
      this.logger.log('Processing admission program notification webhook');

      // Process the notification using the existing service
      const result =
        await this.admissionNotificationService.admissionProgramCreated(
          webhookData,
        );

      return {
        success: true,
        message: 'Admission program notification webhook processed successfully',
        data: result,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to process admission program notification webhook', error.stack);

      throw new BadRequestException({
        success: false,
        message: `Failed to process admission program notification webhook: ${error.message}`,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Handle scholarship notification webhooks
   */
  async handleScholarshipNotificationWebhook(
    webhookData: ScholarshipNotificationWebhookDto,
  ) {
    try {
      this.logger.log('Processing scholarship notification webhook');

      // Process the notification using the scholarship notification service
      const result =
        await this.scholarshipNotificationService.scholarshipCreated(
          webhookData,
        );

      return {
        success: true,
        message: 'Scholarship notification webhook processed successfully',
        data: result,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to process scholarship notification webhook', error.stack);

      throw new BadRequestException({
        success: false,
        message: `Failed to process scholarship notification webhook: ${error.message}`,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Handle admission program indexing webhooks
   */
  async handleAdmissionProgramIndexingWebhook(
    webhookData: AdmissionProgramIndexingWebhookDto,
  ) {
    try {
      this.logger.log('Processing admission program indexing webhook');

      // Get the Elasticsearch index name from configuration
      const admissionProgramIndexName = this.configService.get(
        'elasticsearch.admissionProgramsIndex',
        { infer: true },
      );

      if (!admissionProgramIndexName) {
        throw new Error(
          'Elasticsearch admission programs index not configured',
        );
      }


      // Ensure campus_level fallback and clamping (internal policy: 1..7, default 7)
      const normalizedCampusLevel =
        typeof webhookData.campus_level === 'number' && isFinite(webhookData.campus_level)
          ? Math.min(7, Math.max(1, webhookData.campus_level))
          : 7;

      const payload = { ...webhookData, campus_level: normalizedCampusLevel };

      // Index the document to Elasticsearch
      // TODO: Create a dedicated service that accepts a typed document for indexing into the admission programs index
      await this.elasticsearchService.indexDocument(
        admissionProgramIndexName,
        payload.doc_id,
        payload,
      );

      this.logger.log(
        `Successfully indexed admission program ${webhookData.doc_id} to Elasticsearch`,
      );

      return {
        success: true,
        message: 'Admission program indexed successfully',
        data: {
          admission_program_id: webhookData.doc_id,
          index_name: admissionProgramIndexName,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        'Failed to process admission program indexing webhook',
        error.stack,
      );

      throw new BadRequestException({
        success: false,
        message: `Failed to index admission program: ${error.message}`,
        timestamp: new Date(),
      });
    }
  }
}
