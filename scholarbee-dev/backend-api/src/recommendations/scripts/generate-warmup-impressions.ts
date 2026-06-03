import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { ImpressionService } from '../services/impression.service';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { UserEvent, UserEventDocument } from '../schemas/user-event.schema';
import { RecommendationService } from '../services/recommendation.service';
import { RecommendationType } from '../dto/get-recommendations.dto';
import { RecommendationResourceType } from '../types/recommendation.types';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const impressionService = app.get(ImpressionService);
  const userEventModel = app.get<Model<UserEventDocument>>(getModelToken(UserEvent.name));
  const recommendationService = app.get(RecommendationService);

  const status = await impressionService.getDataStatus();
  if (status.labeled_impressions > 100) {
    console.log(`Skipping warm-up: already have ${status.labeled_impressions} labeled impressions.`);
    await app.close();
    return;
  }

  console.log('Generating synthetic warm-up data...');
  
  // 1. Load all existing behavioral events
  const events = await userEventModel.find({
    event_type: { $in: ['click', 'favorite', 'apply'] },
    resource_type: RecommendationResourceType.ADMISSION_PROGRAM,
    user_id: { $exists: true, $ne: null }
  }).lean().exec();

  if (events.length === 0) {
    console.log('No behavioral events found to generate warm-up data from.');
    await app.close();
    return;
  }

  let posCount = 0;
  let negCount = 0;

  // Process uniquely per user to avoid redundantly scoring everything many times
  const userEventsMap = new Map<string, any[]>();
  for (const event of events) {
    const uid = event.user_id.toString();
    if (!userEventsMap.has(uid)) userEventsMap.set(uid, []);
    userEventsMap.get(uid).push(event);
  }

  for (const [userIdStr, userEvents] of userEventsMap.entries()) {
    // Generate scores for this user using existing engine
    const recs = await recommendationService.getRecommendations({
      type: RecommendationType.PROGRAMS,
      page: 1,
      limit: 100, // Get top 100
    }, { userId: userIdStr });

    const scoredPrograms = recs.data;

    // Build map for quick access
    const programMap = new Map<string, any>();
    for (const p of scoredPrograms) {
      programMap.set(p._id.toString(), p);
    }

    // Process user's events
    const positiveProgramIds = new Set<string>();

    for (const event of userEvents) {
      const pId = event.resource_id.toString();
      const program = programMap.get(pId);
      if (!program) continue; // Unscored or not in top 100
      
      positiveProgramIds.add(pId);

      const sessionId = `warmup_${event._id}`;
      
      // Log Positive Impression
      await impressionService.logImpression(
        userIdStr,
        sessionId,
        [program],
        'rules'
      );
      
      // Manually label it directly after
      const action = event.event_type === 'click' ? 'click' : (event.event_type === 'apply' ? 'apply' : 'favorite');
      await impressionService.recordAction(userIdStr, pId, action as 'click'|'favorite'|'apply');
      posCount++;

      // Generate 4 negative impressions from same user pool
      let n = 0;
      const negatives = [];
      for (const negP of scoredPrograms) {
        const negId = negP._id.toString();
        if (negId !== pId && !positiveProgramIds.has(negId)) {
          negatives.push(negP);
          n++;
        }
        if (n >= 4) break;
      }

      if (negatives.length > 0) {
        await impressionService.logImpression(
          userIdStr,
          sessionId, // Same session ID
          negatives,
          'rules'
        );
        // They default to label=null, so we must force them to 0
        const impressionModel = app.get<Model<any>>(getModelToken('Impression'));
        await impressionModel.updateMany(
          { session_id: sessionId, label: null },
          { $set: { label: 0, was_ignored: true, session_closed_at: new Date() } }
        );
        negCount += negatives.length;
      }
    }
  }

  console.log(`Successfully generated ${posCount} positive and ${negCount} negative impressions.`);
  await app.close();
}

bootstrap().catch(console.error);
