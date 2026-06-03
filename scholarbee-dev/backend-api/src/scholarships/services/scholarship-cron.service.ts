import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import {
  Scholarship,
  ScholarshipDocument,
} from '../schemas/scholarship.schema';

@Injectable()
export class ScholarshipCronService {
  private readonly logger = new Logger(ScholarshipCronService.name);

  constructor(
    @InjectModel(Scholarship.name)
    private scholarshipModel: Model<ScholarshipDocument>,
  ) { }

  /**
   * Cron job that runs every day at midnight (00:00)
   * Updates expired scholarships status from 'open' to 'closed'
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'update-expired-scholarships',
    timeZone: 'UTC',
  })
  async updateExpiredScholarships() {
    this.logger.log('Starting expired scholarships update job...');

    try {
      const now = new Date();

      // Find all scholarships that are:
      // 1. Currently marked as 'open'
      // 2. Have passed their application deadline
      const expiredScholarships = await this.scholarshipModel.find({
        status: 'open',
        application_deadline: { $lt: now },
      }).lean();

      if (expiredScholarships.length === 0) {
        this.logger.log('No expired scholarships found to update.');
        return;
      }

      // Get the IDs of expired scholarships
      const expiredScholarshipIds = expiredScholarships.map(
        (scholarship) => scholarship._id,
      );

      // Update all expired scholarships to 'closed' status
      const updateResult = await this.scholarshipModel.updateMany(
        {
          _id: { $in: expiredScholarshipIds },
        },
        {
          $set: { status: 'closed' },
        },
      );

      this.logger.log(
        `Successfully updated ${updateResult.modifiedCount} expired scholarships from 'open' to 'closed' status.`,
      );

      // Log details of updated scholarships for monitoring
      expiredScholarships.forEach((scholarship) => {
        this.logger.log(
          `Updated scholarship: ${scholarship.scholarship_name} (ID: ${scholarship._id}) - Deadline: ${scholarship.application_deadline}`,
        );
      });
    } catch (error) {
      this.logger.error('Error updating expired scholarships:', error.stack);
    }
  }

  /**
   * Manual method to update expired scholarships (for testing purposes)
   */
  async manuallyUpdateExpiredScholarships() {
    this.logger.log('Manually triggering expired scholarships update...');
    await this.updateExpiredScholarships();
  }

  /**
   * Get count of scholarships that should be expired but are still marked as 'open'
   * Useful for monitoring and debugging
   */
  async getExpiredScholarshipsCount(): Promise<number> {
    const now = new Date();
    return await this.scholarshipModel.countDocuments({
      status: 'open',
      application_deadline: { $lt: now },
    });
  }
}
