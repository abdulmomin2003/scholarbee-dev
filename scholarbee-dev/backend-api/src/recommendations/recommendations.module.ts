import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { AdmissionProgram, AdmissionProgramSchema } from 'src/admission-programs/schemas/admission-program.schema';
import { University, UniversitySchema } from 'src/universities/schemas/university.schema';
import { Application, ApplicationSchema } from 'src/applications/schemas/application.schema';
import { UserEvent, UserEventSchema } from './schemas/user-event.schema';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationService } from './services/recommendation.service';
import { ScoringEngineService } from './services/scoring-engine.service';
import { UserEventService } from './services/user-event.service';
import { SeedService } from './services/seed.service';
import { KnowledgeGraphService } from './services/knowledge-graph.service';
import { BayesianWeightService } from './services/bayesian-weight.service';
import { RecommendationCacheService } from './recommendation-cache.service';
import { StudentContextCacheService } from './student-context-cache.service';
import { RecommendationCronService } from './services/recommendation-cron.service';

// Additional referenced schemas for lightweight pre-queries in scoring engine
import { Admission, AdmissionSchema } from 'src/admissions/schemas/admission.schema';
import { Program, ProgramSchema } from 'src/programs/schemas/program.schema';
import { ProgramTemplate, ProgramTemplateSchema } from 'src/program-templates/schemas/program-template.schema';
import { Campus, CampusSchema } from 'src/campuses/schemas/campus.schema';
import { Address, AddressSchema } from 'src/addresses/schemas/address.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AdmissionProgram.name, schema: AdmissionProgramSchema },
      { name: University.name, schema: UniversitySchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: UserEvent.name, schema: UserEventSchema },
      { name: Admission.name, schema: AdmissionSchema },
      { name: Program.name, schema: ProgramSchema },
      { name: ProgramTemplate.name, schema: ProgramTemplateSchema },
      { name: Campus.name, schema: CampusSchema },
      { name: Address.name, schema: AddressSchema },
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [
    RecommendationService,
    ScoringEngineService,
    UserEventService,
    SeedService,
    KnowledgeGraphService,
    BayesianWeightService,
    RecommendationCacheService,
    StudentContextCacheService,
    RecommendationCronService,
  ],
  exports: [
    RecommendationService,
    UserEventService,
    KnowledgeGraphService,
    BayesianWeightService,
    RecommendationCacheService,
    StudentContextCacheService,
    RecommendationCronService,
  ],
})
export class RecommendationsModule {}
