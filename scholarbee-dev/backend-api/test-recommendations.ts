import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { RecommendationService } from './src/recommendations/services/recommendation.service';
import { RecommendationType } from './src/recommendations/dto/get-recommendations.dto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const recommendationService = app.get(RecommendationService);

  console.log('Testing recommendations...');
  const userPayload = { userId: '6a1ca58b520cbc85dc51d387', email: 'abbasimomin0@gmail.com', user_type: 'Student' };
  
  const recs = await recommendationService.getRecommendations({
    type: RecommendationType.PROGRAMS,
    page: 1,
    limit: 10,
  }, userPayload);

  console.log('Got recommendations:', recs.data.length);
  if (recs.data.length > 0) {
    console.log('First recommendation score:', recs.data[0].relevance_score);
  }
  await app.close();
  process.exit(0);
}
bootstrap().catch(console.error);
