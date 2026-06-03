import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { RecommendationService } from '../services/recommendation.service';

async function bootstrap() {
  console.log('Bootstrapping NestJS application context...');
  const app = await NestFactory.createApplicationContext(AppModule);

  const recommendationService = app.get<RecommendationService>(RecommendationService);

  console.log('Running precomputeTrendingRecommendations...');
  await recommendationService.precomputeTrendingRecommendations();
  console.log('Precomputation completed!');

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('Error during precomputation script:', err);
  process.exit(1);
});
