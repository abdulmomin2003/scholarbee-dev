import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResourceProtectionGuard } from 'src/auth/guards/resource-protection.guard';
import { AllowedUserTypesGuard } from 'src/auth/guards/allowed-user-types.guard';
import { AllowedUserTypes } from 'src/auth/decorators/allowed-user-types.decorator';
import { UserNS, User } from 'src/users/schemas/user.schema';
import { AdmissionProgram, AdmissionProgramDocument } from 'src/admission-programs/schemas/admission-program.schema';
import { ScoringEngineService } from './services/scoring-engine.service';
import { UserEventService } from './services/user-event.service';
import { ImpressionService } from './services/impression.service';
import { MLScorerService } from './services/ml-scorer.service';
import { Inject, Body, Patch, Post, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MlShadowComparison, MlShadowComparisonDocument } from './schemas/ml-shadow-comparison.schema';
import Redis from 'ioredis';

import { UserEvent, UserEventDocument } from './schemas/user-event.schema';
import { Impression, ImpressionDocument } from './schemas/impression.schema';

@ApiTags('admin-ml')
@ApiBearerAuth()
@UseGuards(ResourceProtectionGuard, AllowedUserTypesGuard)
@AllowedUserTypes(UserNS.UserType.Super_Admin)
@Controller('admin/ml')
export class AdminMlController {
  constructor(
    private readonly impressionService: ImpressionService,
    private readonly mlScorerService: MLScorerService,
    private readonly scoringEngineService: ScoringEngineService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @InjectModel(MlShadowComparison.name) private readonly shadowModel: Model<MlShadowComparisonDocument>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(AdmissionProgram.name) private readonly programModel: Model<AdmissionProgramDocument>,
    @InjectModel(UserEvent.name) private readonly userEventModel: Model<UserEventDocument>,
    @InjectModel(Impression.name) private readonly impressionModel: Model<ImpressionDocument>,
  ) {}

  @ApiOperation({ summary: 'Get ML data status' })
  @Get('data-status')
  async getDataStatus() {
    return this.impressionService.getDataStatus();
  }

  @ApiOperation({ summary: 'Get overall ML status' })
  @Get('status')
  async getStatus() {
    const dataReady = await this.impressionService.getDataStatus();
    const health = await this.mlScorerService.getHealth();
    
    // Config from Redis or fallback to service
    const mlEnabled = await this.redis.get('ml:config:ml_enabled').then(v => v ? v === 'true' : this.mlScorerService.isMlEnabled());
    const shadowMode = await this.redis.get('ml:config:shadow_mode').then(v => v ? v === 'true' : this.mlScorerService.isShadowMode());
    const rolloutPct = await this.redis.get('ml:config:rollout_pct').then(v => v ? parseInt(v, 10) : this.mlScorerService.getRolloutPct());

    return {
      data: dataReady,
      model: health.status === 'unreachable' ? null : {
        loaded: health.model_loaded,
        version: health.model_version,
        auc_roc: health.auc_roc,
        n_training_samples: health.n_training_samples,
        bootstrap_mode: health.bootstrap_mode,
        trained_at: (health as any).trained_at || null, // Assuming it might be there
        is_training: health.is_training
      },
      service: {
        ml_service_reachable: health.status !== 'unreachable',
        is_training: !!health.is_training,
        last_error: health.last_training_error || null
      },
      config: {
        ml_enabled: mlEnabled,
        shadow_mode: shadowMode,
        rollout_pct: rolloutPct
      }
    };
  }

  @ApiOperation({ summary: 'Trigger ML Training' })
  @Post('train')
  async trainModel(@Body() body: { force?: boolean }) {
    const mlServiceUrl = this.mlScorerService.getServiceUrl();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${mlServiceUrl}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: !!body.force }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        return { status: 'error', message: 'ML service returned error.' };
      }
      return await res.json();
    } catch (e) {
      return { status: 'error', message: 'ML service unreachable.' };
    }
  }

  @ApiOperation({ summary: 'Get Shadow Mode Analytics' })
  @Get('shadow-stats')
  async getShadowStats() {
    const totalComparisons = await this.shadowModel.countDocuments();
    
    // Average correlation across all documents
    const avgResult = await this.shadowModel.aggregate([
      { $group: { _id: null, avg_correlation: { $avg: '$rank_correlation' } } }
    ]);
    const avgCorrelation = avgResult.length > 0 ? avgResult[0].avg_correlation : 0;

    // Recent comparisons
    const recent = await this.shadowModel
      .find()
      .sort({ recorded_at: -1 })
      .limit(20)
      .lean()
      .exec();

    // Trend grouping by day (last 14 days)
    const trend = await this.shadowModel.aggregate([
      { 
        $match: { 
          recorded_at: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$recorded_at" } },
          avg: { $avg: "$rank_correlation" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const mappedTrend = trend.map(t => ({ date: t._id, avg: t.avg, count: t.count }));

    return {
      total_comparisons: totalComparisons,
      avg_rank_correlation: avgCorrelation,
      recent_comparisons: recent.map(r => ({
        student_id: r.student_id,
        correlation: r.rank_correlation,
        ml_top3: r.ml_top5.slice(0, 3),
        rules_top3: r.rules_top5.slice(0, 3),
        recorded_at: r.recorded_at
      })),
      correlation_trend: mappedTrend
    };
  }

  @ApiOperation({ summary: 'Update ML Config' })
  @Patch('config')
  async updateConfig(@Body() body: { ml_enabled?: boolean, shadow_mode?: boolean, rollout_pct?: number }) {
    if (body.ml_enabled !== undefined) {
      await this.redis.set('ml:config:ml_enabled', String(body.ml_enabled));
    }
    if (body.shadow_mode !== undefined) {
      await this.redis.set('ml:config:shadow_mode', String(body.shadow_mode));
    }
    if (body.rollout_pct !== undefined) {
      await this.redis.set('ml:config:rollout_pct', String(body.rollout_pct));
    }
    
    return {
      ml_enabled: await this.redis.get('ml:config:ml_enabled').then(v => v ? v === 'true' : this.mlScorerService.isMlEnabled()),
      shadow_mode: await this.redis.get('ml:config:shadow_mode').then(v => v ? v === 'true' : this.mlScorerService.isShadowMode()),
      rollout_pct: await this.redis.get('ml:config:rollout_pct').then(v => v ? parseInt(v, 10) : this.mlScorerService.getRolloutPct())
    };
  }

  @ApiOperation({ summary: 'Test ML Prediction' })
  @Get('test')
  async testModel(@Query('email') email?: string) {
    try {
      let students: any[] = [];
      
      if (email) {
        // Fetch specific user by email
        students = await this.userModel.find({ email: email.trim() }).limit(1).exec();
        if (students.length === 0) {
          return { status: 'error', message: `No user found with email: ${email}` };
        }
      } else {
        // Fetch a random real user with onboarding data
        students = await this.userModel.aggregate([
          { 
            $match: { 
              'onboarding_preferences.degree_goal': { $exists: true, $ne: null }
            } 
          },
          { $sample: { size: 1 } }
        ]).exec();

        if (!students || students.length === 0) {
          return { status: 'error', message: 'No users found with complete onboarding data to test with.' };
        }
      }
      
      const student = students[0];

      // 2. Fetch 5 random programs
      const programs = await this.programModel.aggregate([
        { $match: { status: { $ne: 'draft' } } },
        { $sample: { size: 5 } }
      ]).exec();

      if (!programs || programs.length === 0) {
        return { status: 'error', message: 'No active admission programs found.' };
      }

      // 3. Run through Scoring Engine to get real features
      const rulesRanked = await this.scoringEngineService.scorePrograms(student, [], programs as any);

      // 4. Run through ML Scorer
      const featureSnapshots: Record<string, any> = {};
      rulesRanked.forEach(c => {
        featureSnapshots[c.program_id] = c.features;
      });

      const mlScores = await this.mlScorerService.score(student._id.toString(), rulesRanked, featureSnapshots);
      if (!mlScores || mlScores.length === 0) {
        return { status: 'error', message: 'ML service did not return any scores. Model might not be loaded.' };
      }
      
      const mlScoreMap = new Map<string, number>();
      for (const s of mlScores) {
        mlScoreMap.set(s.program_id, s.ml_score);
      }

      const results = rulesRanked.map(c => ({
        program_id: c.program_id,
        program_name: (c as any).program_title,
        university_name: c.university_name,
        campus_name: c.campus_name,
        tuition_fee: (c as any).first_semester_fee,
        rules_score: c.relevance_score,
        ml_score: mlScoreMap.get(c.program_id) || 0,
        features: c.features
      })).sort((a, b) => b.ml_score - a.ml_score);

      return {
        status: 'success',
        student: {
          id: student._id.toString(),
          name: student.first_name ? `${student.first_name} ${student.last_name || ''}`.trim() : student.email,
          intended_major: student.onboarding_preferences?.preferred_fields_of_study?.[0] || 'Undecided',
          study_destination: student.onboarding_preferences?.preferred_cities?.join(', ') || 'Anywhere',
          degree_level: student.onboarding_preferences?.degree_goal || 'Not Specified',
        },
        results
      };
    } catch (err: any) {
      console.error('Test Model Error', err);
      return { status: 'error', message: err.message };
    }
  }

  @ApiOperation({ summary: 'Hard Reset ML System Data' })
  @Post('hard-reset')
  async hardReset() {
    try {
      // 1. Clear Impressions
      await this.impressionModel.deleteMany({});
      
      // 2. Clear User Events
      await this.userEventModel.deleteMany({});
      
      // 3. Clear Shadow Comparisons
      await this.shadowModel.deleteMany({});
      
      // 4. Reset User Bayesian Weights
      await this.userModel.updateMany(
        { bayesian_weights: { $exists: true } },
        { $unset: { bayesian_weights: 1 } }
      );
      
      // 5. Clear Redis Cache (Keys matching rec:*)
      const keys = await this.redis.keys('rec:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      
      return { success: true, message: 'ML System has been successfully hard reset to scratch.' };
    } catch (error: any) {
      return { success: false, message: 'Failed to hard reset system.', error: error.message };
    }
  }
}
