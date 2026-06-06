// import { NestFactory } from '@nestjs/core';
// import { AppModule } from '../../app.module';
// import { getModelToken } from '@nestjs/mongoose';
// import { UserEvent } from '../schemas/user-event.schema';
// import { Impression } from '../schemas/impression.schema';
// import { MlShadowComparison } from '../schemas/ml-shadow-comparison.schema';
// import { User } from 'src/users/schemas/user.schema';
// import { Model } from 'mongoose';
// import Redis from 'ioredis';

// async function bootstrap() {
//   const app = await NestFactory.createApplicationContext(AppModule);

//   const userEventModel = app.get<Model<any>>(getModelToken(UserEvent.name));
//   const impressionModel = app.get<Model<any>>(getModelToken(Impression.name));
//   const shadowModel = app.get<Model<any>>(getModelToken(MlShadowComparison.name));
//   const userModel = app.get<Model<any>>(getModelToken(User.name));
//   const redis = app.get<Redis>('REDIS_CLIENT');

//   console.log('--- Initiating ML Hard Reset ---');

//   console.log('1. Clearing Impressions...');
//   await impressionModel.deleteMany({});

//   console.log('2. Clearing User Events...');
//   await userEventModel.deleteMany({});

//   console.log('3. Clearing Shadow Comparisons...');
//   await shadowModel.deleteMany({});

//   console.log('4. Resetting User Bayesian Weights...');
//   await userModel.updateMany(
//     { bayesian_weights: { $exists: true } },
//     { $unset: { bayesian_weights: 1 } }
//   );

//   console.log('5. Clearing Redis Cache...');
//   const keys = await redis.keys('rec:*');
//   if (keys.length > 0) {
//     await redis.del(...keys);
//     console.log(`Deleted ${keys.length} cached keys.`);
//   }

//   console.log('--- Reset Complete! The system is now starting from scratch. ---');

//   await app.close();
//   process.exit(0);
// }

// bootstrap().catch((err) => {
//   console.error(err);
//   process.exit(1);
// });
