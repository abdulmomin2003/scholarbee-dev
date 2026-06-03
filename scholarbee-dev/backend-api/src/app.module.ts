import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  configuration,
  EnvValidationSchema,
  envValidationSchema,
} from 'src/config';
import { IConfiguration } from 'src/config/configuration';
import { AcademicDepartmentsModule } from './academic-departments/academic-departments.module';
import { AddressesModule } from './addresses/addresses.module';
import { AdmissionProgramsModule } from './admission-programs/admission-programs.module';
import { AdmissionsModule } from './admissions/admissions.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationsModule } from './applications/applications.module';
import { AuthModule } from './auth/auth.module';
import { BlogPostsModule } from './blog-posts/blog-posts.module';
import { CampusesModule } from './campuses/campuses.module';
import { ChatModule } from './chat/chat.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { CommonModule } from './common/common.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { ContactUsModule } from './contact-us/contact-us.module';
import { ExternalApplicationsModule } from './external-applications/external-applications.module';
import { FeeStructuresModule } from './fee-structures/fee-structures.module';
import { LegalDocumentsModule } from './legal-documents/legal-documents.module';
import { EmailModule } from './email/email.module';
import { ReferenceSystemModule } from './reference-system/reference-system.module';
import { MediaManagementModule } from './media-management/media-management.module';
import { NotificationModule } from './notification/notification.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ProgramTemplatesModule } from './program-templates/program-templates.module';
import { ProgramsModule } from './programs/programs.module';
import { RegionsModule } from './regions/regions.module';
import { ScholarshipsModule } from './scholarships/scholarships.module';
import { StudentScholarshipsModule } from './student-scholarships/student-scholarships.module';
import { UniversitiesModule } from './universities/universities.module';
import { UsersModule } from './users/users.module';
import { SwaggerModule } from './swagger/swagger.module';
import { timestampsPlugin } from './common/plugins/mongoose-timestamp.plugin';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    RedisModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      expandVariables: true, // enables variable-expansion in .env files i.e. ${env1}+${env2}
      load: [configuration], // the return of this will be directly accessible from the configService
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false, // This option allows all validation errors to be reported at once, rather than stopping after the first error,
        // allowUnknown: false
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // ? Even though configService has access to both the configuration and the env-vars, as a best practice, we should only access the values from the configuration object instead of the env-vars.
      useFactory: (
        configService: ConfigService<IConfiguration & EnvValidationSchema>,
      ) => ({
        uri: configService.get('database.uri', { infer: true })!,
        connectionFactory: (connection) => {
          connection.plugin(timestampsPlugin);

          return connection;
        },
      }),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 5, // 5 requests per minute
      },
    ]),
    EmailModule,
    CommonModule,
    UsersModule,
    AuthModule,
    UniversitiesModule,
    OrganizationsModule,
    CampusesModule,
    AcademicDepartmentsModule,
    AddressesModule,
    ChatModule,
    ChatbotModule,
    AdmissionsModule,
    AdmissionProgramsModule,
    ApplicationsModule,
    ExternalApplicationsModule,
    ContactUsModule,
    FeeStructuresModule,
    ProgramTemplatesModule,
    RegionsModule,
    StudentScholarshipsModule,
    ScholarshipsModule,
    ProgramsModule,
    BlogPostsModule,
    MediaManagementModule,
    AnalyticsModule,
    NotificationModule,
    WebhooksModule,
    LegalDocumentsModule,
    ReferenceSystemModule,
    SwaggerModule,
    RecommendationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
