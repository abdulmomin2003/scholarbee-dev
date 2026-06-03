import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Fetch values from configService.get
        const host = configService.get<string>('database.redisHost') || 
                     configService.get<string>('REDIS_HOST') || 
                     'localhost';
        const port = configService.get<number>('database.redisPort') || 
                     configService.get<number>('REDIS_PORT') || 
                     6379;
        const password = configService.get<string>('database.redisPassword') || 
                         configService.get<string>('REDIS_PASSWORD') || 
                         undefined;

        return new Redis({
          host,
          port: Number(port),
          password: password || undefined,
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
