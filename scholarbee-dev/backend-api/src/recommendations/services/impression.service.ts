import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Impression, ImpressionDocument } from '../schemas/impression.schema';
import { ProgramFeatures, IRecommendedProgramResponse } from '../types/recommendation.types';

export interface DataStatusResult {
  total_impressions: number;
  labeled_impressions: number;
  positive_labels: number;
  negative_labels: number;
  positive_rate: number;
  unique_students: number;
  unique_programs: number;
  oldest_impression: Date | null;
  newest_impression: Date | null;
  ml_ready: boolean;
}

@Injectable()
export class ImpressionService {
  private readonly logger = new Logger(ImpressionService.name);

  constructor(
    @InjectModel(Impression.name)
    private readonly impressionModel: Model<ImpressionDocument>,
  ) {}

  async logImpression(
    studentId: string | null,
    sessionId: string,
    scoredPrograms: IRecommendedProgramResponse[],
    scoringEngine: 'rules' | 'ml',
  ): Promise<void> {
    if (!studentId) return; // Anonymous users aren't logged for ML training

    try {
      const impressions = scoredPrograms.map((program, index) => {
        const features = program.features || {
          degree_match: 0,
          field_similarity: 0,
          city_match: 0,
          fee_match: 0,
          is_partner: false,
          has_active_deadline: false,
          program_popularity: 0,
          student_city_weight: 0,
          student_field_weight: 0,
          student_degree_weight: 0,
          student_fee_weight: 0,
          prior_clicks_on_field: 0,
          prior_clicks_on_city: 0,
          position_in_list: index,
        };
        // Ensure position is correct
        features.position_in_list = index;

        return {
          student_id: studentId,
          program_id: program.program_id,
          session_id: sessionId,
          position: index,
          scoring_engine: scoringEngine,
          label: null,
          was_clicked: false,
          was_favorited: false,
          was_applied: false,
          was_ignored: false,
          shown_at: new Date(),
          acted_at: null,
          session_closed_at: null,
          features: features,
        };
      });

      if (impressions.length > 0) {
        await this.impressionModel.insertMany(impressions);
      }
    } catch (error) {
      this.logger.warn(`Failed to log impressions for session ${sessionId}: ${error.message}`);
    }
  }

  async recordAction(
    studentId: string,
    programId: string,
    action: 'click' | 'favorite' | 'apply',
  ): Promise<void> {
    try {
      // Find the most recent unresolved impression for this student + program
      const impression = await this.impressionModel.findOne({
        student_id: studentId,
        program_id: programId,
        label: null,
      }).sort({ shown_at: -1 });

      const now = new Date();
      const updateData: any = {
        label: 1,
        acted_at: now,
      };

      if (action === 'click') updateData.was_clicked = true;
      if (action === 'favorite') updateData.was_favorited = true;
      if (action === 'apply') updateData.was_applied = true;

      if (impression) {
        await this.impressionModel.updateOne(
          { _id: impression._id },
          { $set: updateData }
        );
      } else {
        // Create retroactive impression if none found
        await this.impressionModel.create({
          student_id: studentId,
          program_id: programId,
          session_id: `retroactive_${now.getTime()}`,
          position: -1, // Unknown position
          scoring_engine: 'rules', // Default assumption
          label: 1,
          was_clicked: action === 'click',
          was_favorited: action === 'favorite',
          was_applied: action === 'apply',
          was_ignored: false,
          shown_at: now,
          acted_at: now,
          session_closed_at: null,
          features: {
            degree_match: 0,
            field_similarity: 0,
            city_match: 0,
            fee_match: 0,
            is_partner: false,
            has_active_deadline: false,
            program_popularity: 0,
            student_city_weight: 0,
            student_field_weight: 0,
            student_degree_weight: 0,
            student_fee_weight: 0,
            prior_clicks_on_field: 0,
            prior_clicks_on_city: 0,
            position_in_list: -1,
          },
        });
      }
    } catch (error) {
      this.logger.warn(`Failed to record action for student ${studentId} on program ${programId}: ${error.message}`);
    }
  }

  async closeExpiredSessions(): Promise<void> {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const result = await this.impressionModel.updateMany(
        {
          label: null,
          shown_at: { $lt: thirtyMinutesAgo },
        },
        {
          $set: {
            was_ignored: true,
            label: 0,
            session_closed_at: new Date(),
          },
        }
      );
      this.logger.log(`Closed ${result.modifiedCount} expired impression sessions`);
    } catch (error) {
      this.logger.error(`Failed to close expired sessions: ${error.message}`);
    }
  }

  async getDataStatus(): Promise<DataStatusResult> {
    try {
      const [
        total,
        labeled,
        positive,
        negative,
        uniqueStudents,
        uniquePrograms,
        oldest,
        newest
      ] = await Promise.all([
        this.impressionModel.countDocuments(),
        this.impressionModel.countDocuments({ label: { $ne: null } }),
        this.impressionModel.countDocuments({ label: 1 }),
        this.impressionModel.countDocuments({ label: 0 }),
        this.impressionModel.distinct('student_id', { label: { $ne: null } }).then(res => res.length),
        this.impressionModel.distinct('program_id', { label: { $ne: null } }).then(res => res.length),
        this.impressionModel.findOne().sort({ shown_at: 1 }).select('shown_at'),
        this.impressionModel.findOne().sort({ shown_at: -1 }).select('shown_at'),
      ]);

      const positiveRate = labeled > 0 ? positive / labeled : 0;
      
      const mlReady = 
        labeled >= 500 &&
        positiveRate >= 0.03 &&
        positiveRate <= 0.60 &&
        uniqueStudents >= 20 &&
        uniquePrograms >= 10;

      return {
        total_impressions: total,
        labeled_impressions: labeled,
        positive_labels: positive,
        negative_labels: negative,
        positive_rate: positiveRate,
        unique_students: uniqueStudents,
        unique_programs: uniquePrograms,
        oldest_impression: oldest?.shown_at || null,
        newest_impression: newest?.shown_at || null,
        ml_ready: mlReady,
      };
    } catch (error) {
      this.logger.error(`Failed to get data status: ${error.message}`);
      throw error;
    }
  }
}
