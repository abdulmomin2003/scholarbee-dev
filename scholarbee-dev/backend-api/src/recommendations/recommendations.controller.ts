import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OptionalAuthGuard } from 'src/auth/guards/optional-auth.guard';
import { OptionalAuthReq } from 'src/auth/decorators/auth-req.decorator';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';
import { TrackEventDto } from './dto/track-event.dto';
import { RecommendationService } from './services/recommendation.service';
import { UserEventService } from './services/user-event.service';
import { SeedService } from './services/seed.service';
import { ProgramRecommendationsResponseDto, UniversityRecommendationsResponseDto } from './dto/recommendation-response.dto';

@ApiTags('recommendations -> 🧠 (AI Recs)')
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly userEventService: UserEventService,
    private readonly seedService: SeedService,
  ) {}

  @ApiOperation({
    summary: 'Get personalized program or university recommendations',
    description: 'Returns content-based + behavioral recommendations based on onboarding preferences and click history. Fallbacks to trending if cold-start.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched recommendations',
    type: ProgramRecommendationsResponseDto,
  })
  @UseGuards(OptionalAuthGuard)
  @Get()
  async getRecommendations(
    @Query() dto: GetRecommendationsDto,
    @OptionalAuthReq() req: any,
  ) {
    const authHeader = req?.headers?.authorization;
    const userPayload = req?.user || null;
    console.log('[RecommendationsController] Incoming request:', {
      hasAuthHeader: !!authHeader,
      authHeaderSnippet: authHeader ? `${authHeader.substring(0, 20)}...` : null,
      userPayload: userPayload ? {
        userId: userPayload.userId || userPayload._id || userPayload.sub,
        email: userPayload.email,
        user_type: userPayload.user_type
      } : null
    });
    return this.recommendationService.getRecommendations(dto, userPayload);
  }

  @ApiOperation({
    summary: 'Track a user interaction event',
    description: 'Tracks click, dwell time, application submission, or favorites behavior to feed into user profile.',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully recorded the event',
  })
  @UseGuards(OptionalAuthGuard)
  @Post('events')
  async trackEvent(
    @Body() dto: TrackEventDto,
    @OptionalAuthReq() req: any,
  ) {
    const userPayload = req?.user || null;
    const userId = userPayload ? (userPayload.userId || userPayload._id || userPayload.sub) : null;
    const sessionId = dto.metadata?.session_id || null;

    await this.userEventService.trackEvent(userId, sessionId, dto);
    return { success: true };
  }

  @ApiOperation({
    summary: 'Seed recommendations demo data',
    description: 'Helper endpoint for developers to seed a demo student with onboarding preferences and clicks.',
  })
  @Post('seed-demo')
  async seedDemo() {
    return this.seedService.seedDemoData();
  }
}
