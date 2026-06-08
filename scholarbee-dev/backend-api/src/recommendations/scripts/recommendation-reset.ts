import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { UserEvent } from '../schemas/user-event.schema';
import { User } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import Redis from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userEventModel = app.get<Model<any>>(getModelToken(UserEvent.name));
  const userModel = app.get<Model<any>>(getModelToken(User.name));
  const redis = app.get<Redis>('REDIS_CLIENT');

  console.log('--- Initiating Recommendation Engine Reset ---');

  console.log('1. Clearing User Recommendation Events...');
  await userEventModel.deleteMany({});

  console.log('2. Resetting User Bayesian Weights...');
  await userModel.updateMany(
    { bayesian_weights: { $exists: true } },
    { $unset: { bayesian_weights: 1 } }
  );

  console.log('3. Clearing Redis Recommendation Cache...');
  const keys = await redis.keys('rec:*');
  if (keys.length > 0) {
    await redis.del(...keys);
    console.log(`Deleted ${keys.length} cached keys.`);
  }

  console.log('--- Reset Complete! The system is now starting from scratch. ---');

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
