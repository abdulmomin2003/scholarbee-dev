import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserEvent, UserEventDocument } from '../schemas/user-event.schema';
import { ITrackEventPayload, UserRecommendationEventType, RecommendationResourceType } from '../types/recommendation.types';
import { AdmissionProgram, AdmissionProgramDocument } from 'src/admission-programs/schemas/admission-program.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { BayesianWeightService } from './bayesian-weight.service';
import { RecommendationCacheService } from '../recommendation-cache.service';
import { StudentContextCacheService } from '../student-context-cache.service';
import { RecommendationService } from './recommendation.service';
import { RecommendationType } from '../dto/get-recommendations.dto';
import { ImpressionService } from './impression.service';

@Injectable()
export class UserEventService {
  private readonly logger = new Logger(UserEventService.name);

  constructor(
    @InjectModel(UserEvent.name)
    private readonly userEventModel: Model<UserEventDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(AdmissionProgram.name)
    private readonly admissionProgramModel: Model<AdmissionProgramDocument>,
    private readonly bayesianWeightService: BayesianWeightService,
    private readonly recommendationCacheService: RecommendationCacheService,
    private readonly studentContextCacheService: StudentContextCacheService,
    @Inject(forwardRef(() => RecommendationService))
    private readonly recommendationService: RecommendationService,
    private readonly impressionService: ImpressionService,
  ) {}

  /**
   * Tracks and records a user interaction event.
   */
  async trackEvent(
    userId: string | null,
    sessionId: string | null,
    payload: ITrackEventPayload,
  ): Promise<UserEventDocument> {
    const event = new this.userEventModel({
      user_id: userId ? new Types.ObjectId(userId) : undefined,
      session_id: sessionId || undefined,
      event_type: payload.event_type,
      resource_type: payload.resource_type,
      resource_id: new Types.ObjectId(payload.resource_id),
      metadata: payload.metadata ? new Map(Object.entries(payload.metadata)) : undefined,
    });

    // If resource is an admission program, extract the dimension context
    if (payload.resource_type === RecommendationResourceType.ADMISSION_PROGRAM) {
      try {
        const ap = await this.admissionProgramModel
          .findById(payload.resource_id)
          .populate({
            path: 'program',
            populate: [
              { path: 'template' },
              {
                path: 'campus_id',
                populate: { path: 'address_id' },
              },
              { path: 'fee_structure' },
            ],
          })
          .exec();

        if (ap) {
          const programObj: any = ap.program;
          const template = programObj?.template || {};
          const campus = programObj?.campus_id || {};
          const address = campus?.address_id || {};
          const feeStructure = programObj?.fee_structure || {};

          event.field = template.field_of_study || '';
          event.city = address.city || campus.city || '';
          event.degree_level = template.degree_level || '';

          const fee = feeStructure?.tuition_fee || parseFloat(ap.admission_fee) || 0;
          let feeBucket = 4;
          if (fee < 100000) feeBucket = 1;
          else if (fee < 200000) feeBucket = 2;
          else if (fee < 300000) feeBucket = 3;
          event.fee_bucket = feeBucket;

          // If student is logged in, perform Bayesian weight updates
          if (userId && Types.ObjectId.isValid(userId)) {
            const student = await this.userModel.findById(userId).exec();
            if (student) {
              let action: 'click' | 'favorite' | 'apply' | 'ignore' = 'click';
              let recordableAction: 'click' | 'favorite' | 'apply' | null = null;
              
              if (payload.event_type === UserRecommendationEventType.FAVORITE) {
                action = 'favorite';
                recordableAction = 'favorite';
              } else if (payload.event_type === UserRecommendationEventType.APPLY) {
                action = 'apply';
                recordableAction = 'apply';
              } else if (payload.event_type === UserRecommendationEventType.CLICK) {
                action = 'click';
                recordableAction = 'click';
              } else {
                action = 'click'; // default
              }

              if (recordableAction) {
                this.impressionService.recordAction(
                  userId,
                  payload.resource_id,
                  recordableAction
                ).catch(err => this.logger.warn(`Failed to record action: ${err.message}`));
              }

              const updatedPriors = this.bayesianWeightService.updateWeights(
                student.bayesian_weights,
                { program: ap, student, action }
              );

              student.bayesian_weights = updatedPriors;
              await student.save();
              this.logger.log(`Updated Bayesian weights for user ${userId} on action: ${action}`);
            }
          }
        }
      } catch (error) {
        this.logger.error(`Failed to process Bayesian weights for event: ${error.message}`, error.stack);
      }
    }

    // Invalidate caches and trigger background recomputation if user is logged in
    if (userId) {
      this.recommendationCacheService.invalidate(String(userId))
        .then(() => this.studentContextCacheService.invalidate(String(userId)))
        .then(() => {
          // Trigger background recomputation (fire-and-forget, do NOT await)
          this.recomputeRecommendationsInBackground(String(userId)).catch((err) => {
            this.logger.error(`Background recompute failed for user ${userId}: ${err.message}`);
          });
        })
        .catch((err) => {
          this.logger.error(`Failed to invalidate cache for user ${userId}: ${err.message}`);
        });
    }

    return event.save();
  }

  /**
   * Runs the full recommendation pipeline in the background and writes to Redis cache.
   */
  private async recomputeRecommendationsInBackground(userId: string): Promise<void> {
    this.logger.log(`Starting background recommendation recomputation for student ${userId}`);
    const mockPayload = { userId, user_type: 'Student' };
    await Promise.all([
      this.recommendationService.getRecommendations({ type: RecommendationType.PROGRAMS }, mockPayload),
      this.recommendationService.getRecommendations({ type: RecommendationType.UNIVERSITIES }, mockPayload),
    ]);
    this.logger.log(`Background recommendation recomputation completed for student ${userId}`);
  }

  /**
   * Counts the total number of behavioral interaction events for a user
   * to determine if we should switch weights from onboarding to behavioral/hybrid.
   */
  async getBehavioralEventCount(userId: string): Promise<number> {
    if (!userId) return 0;
    return this.userEventModel.countDocuments({
      user_id: new Types.ObjectId(userId),
    });
  }

  /**
   * Retrieves behavioral events for a user to calculate user interests/profiles.
   */
  async getUserEvents(userId: string, limit = 100): Promise<UserEventDocument[]> {
    if (!userId) return [];
    return this.userEventModel
      .find({ user_id: new Types.ObjectId(userId) })
      .sort({ created_at: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Retrieves recent global behavioral events for calculating trending popularity.
   */
  async getRecentGlobalEvents(limit = 500): Promise<UserEventDocument[]> {
    return this.userEventModel
      .find({})
      .sort({ created_at: -1 })
      .limit(limit)
      .exec();
  }
}
