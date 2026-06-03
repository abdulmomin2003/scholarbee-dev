import { Injectable, Logger, OnApplicationBootstrap, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserNS } from 'src/users/schemas/user.schema';
import { ScoringEngineService } from './scoring-engine.service';
import { UserEventService } from './user-event.service';
import { GetRecommendationsDto, RecommendationType } from '../dto/get-recommendations.dto';
import { Application } from 'src/applications/schemas/application.schema';
import { RecommendationCacheService } from '../recommendation-cache.service';
import { StudentContextCacheService } from '../student-context-cache.service';
import * as crypto from 'crypto';

@Injectable()
export class RecommendationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Application.name)
    private readonly applicationModel: Model<any>,
    private readonly scoringEngineService: ScoringEngineService,
    @Inject(forwardRef(() => UserEventService))
    private readonly userEventService: UserEventService,
    private readonly recommendationCacheService: RecommendationCacheService,
    private readonly studentContextCacheService: StudentContextCacheService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Warming recommendations trending cache on application bootstrap...');
    try {
      await this.precomputeTrendingRecommendations();
      this.logger.log('Warmed programs and universities trending cache successfully.');
    } catch (error) {
      this.logger.error(`Failed to warm trending caches: ${error.message}`, error.stack);
    }
  }

  /**
   * Precomputes and caches trending recommendations for anonymous/fallback paths.
   */
  async precomputeTrendingRecommendations(): Promise<void> {
    const globalEvents = await this.userEventService.getRecentGlobalEvents(5000);
    const [programs, universities] = await Promise.all([
      this.scoringEngineService.scorePrograms(null, globalEvents, []),
      this.scoringEngineService.scoreUniversities(null, globalEvents, []),
    ]);

    await Promise.all([
      this.recommendationCacheService.setTrending(RecommendationType.PROGRAMS, programs),
      this.recommendationCacheService.setTrending(RecommendationType.UNIVERSITIES, universities),
    ]);
  }

  /**
   * Precomputes and caches personalized recommendations for a logged in student user.
   */
  async precomputeStudentRecommendations(userId: string): Promise<void> {
    const studentContext = await this.getStudentContext(userId);
    if (!studentContext) return;

    const [events, applications] = await Promise.all([
      this.userEventService.getUserEvents(userId),
      this.applicationModel.find({ applicant: studentContext._id }).lean().exec(),
    ]);

    const [programs, universities] = await Promise.all([
      this.scoringEngineService.scorePrograms(studentContext, events, applications),
      this.scoringEngineService.scoreUniversities(studentContext, events, applications),
    ]);

    await Promise.all([
      this.recommendationCacheService.set(userId, RecommendationType.PROGRAMS, programs),
      this.recommendationCacheService.set(userId, RecommendationType.UNIVERSITIES, universities),
    ]);
  }

  /**
   * Helper to retrieve student context from cache or MongoDB.
   */
  private async getStudentContext(userId: string): Promise<any | null> {
    const cached = await this.studentContextCacheService.get(userId);
    if (cached) {
      return cached;
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) return null;

    const context = {
      _id: user._id.toString(),
      onboarding_preferences: user.onboarding_preferences,
      bayesian_weights: user.bayesian_weights,
      user_type: user.user_type,
    };

    await this.studentContextCacheService.set(userId, context);
    return context;
  }

  /**
   * Orchestrates recommendation generation for programs or universities.
   * Leverages caching, context resolution, and paginates from cache.
   */
  async getRecommendations(
    dto: GetRecommendationsDto,
    currentUserPayload: any | null,
  ) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const isProgram = dto.type === RecommendationType.PROGRAMS;

    const userId = currentUserPayload ? (currentUserPayload.userId || currentUserPayload._id || currentUserPayload.sub) : null;
    let isAdmin = false;

    if (currentUserPayload) {
      const userType = currentUserPayload.user_type;
      isAdmin = userType === UserNS.UserType.Super_Admin || userType === 'Admin';
    }

    // A. Anonymous / Cold-start Cache
    if (!userId) {
      const cachedTrending = await this.recommendationCacheService.getTrending(dto.type);
      if (cachedTrending) {
        this.logger.log(`[Cache HIT] Returning cached trending ${dto.type} recommendations`);
        return await this.paginateAndLogImpression(cachedTrending, page, limit, isAdmin);
      }

      this.logger.log(`[Cache MISS] Computing trending ${dto.type} recommendations`);
      const globalEvents = await this.userEventService.getRecentGlobalEvents(5000);
      
      let trendingRecs = [];
      if (isProgram) {
        trendingRecs = await this.scoringEngineService.scorePrograms(null, globalEvents, []);
      } else {
        trendingRecs = await this.scoringEngineService.scoreUniversities(null, globalEvents, []);
      }

      await this.recommendationCacheService.setTrending(dto.type, trendingRecs);
      return await this.paginateAndLogImpression(trendingRecs, page, limit, isAdmin);
    }

    // B. Logged in User Cache
    const cachedRecs = await this.recommendationCacheService.get(String(userId), dto.type);
    if (cachedRecs) {
      this.logger.log(`[Cache HIT] Returning cached ${dto.type} recommendations for student ${userId}`);
      return await this.paginateAndLogImpression(cachedRecs, page, limit, isAdmin);
    }

    // Cache MISS: compute
    this.logger.log(`[Cache MISS] Computing personalized ${dto.type} recommendations for student ${userId}`);
    const studentContext = await this.getStudentContext(String(userId));
    
    let events: any[] = [];
    let applications: any[] = [];
    
    if (studentContext) {
      events = await this.userEventService.getUserEvents(String(studentContext._id));
      applications = await this.applicationModel
        .find({ applicant: studentContext._id })
        .exec();
    }

    let recommendations: any[] = [];
    if (isProgram) {
      recommendations = await this.scoringEngineService.scorePrograms(studentContext, events, applications);
    } else {
      recommendations = await this.scoringEngineService.scoreUniversities(studentContext, events, applications);
    }

    // Cache the complete scored list for the user
    await this.recommendationCacheService.set(String(userId), dto.type, recommendations);

    return await this.paginateAndLogImpression(recommendations, page, limit, isAdmin);
  }

  /**
   * Helper to format, paginate, and return payload.
   */
  private async paginateAndLogImpression(recommendations: any[], page: number, limit: number, isAdmin: boolean) {
    const total = recommendations.length;
    const startIndex = (page - 1) * limit;
    const slicedData = recommendations.slice(startIndex, startIndex + limit);

    const sessionId = crypto.randomUUID();

    const formattedData = slicedData.map((item) => {
      const copy = { ...item };
      if (!isAdmin) {
        delete copy.relevance_score;
      }
      delete copy.features; // Do not leak features to the frontend
      return copy;
    });

    return {
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        session_id: sessionId,
        engine: 'rules',
      },
    };
  }
}
