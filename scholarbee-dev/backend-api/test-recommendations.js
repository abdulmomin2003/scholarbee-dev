const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { RecommendationService } = require('./dist/recommendations/services/recommendation.service');
const { Types } = require('mongoose');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const recommendationService = app.get(RecommendationService);

  console.log('Testing recommendations...');
  const userPayload = { userId: '6a1ca58b520cbc85dc51d387', email: 'abbasimomin0@gmail.com', user_type: 'Student' };
  
  const recs = await recommendationService.getRecommendations({
    type: 'programs',
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
