import { Module } from '@nestjs/common';
import { MediaManagementController, MediaManagementWebhookController } from './media-management.controller';
import { MediaManagementService } from './media-management.service';

@Module({
  controllers: [MediaManagementController, MediaManagementWebhookController],
  providers: [MediaManagementService]
})
export class MediaManagementModule { }
