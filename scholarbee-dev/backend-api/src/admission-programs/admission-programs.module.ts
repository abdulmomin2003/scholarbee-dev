import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsModule } from 'src/analytics/analytics.module';
import { AuthModule } from 'src/auth/auth.module';
import { ElasticsearchModule } from 'src/elasticsearch/elasticsearch.module';
import { UniversityModelsModule } from 'src/universities/university-models.module';
import { AdmissionProgramsController } from './controllers/admission-programs.controller';
import { AdmissionProgramsGateway } from './gateways/admission-programs.gateway';
import {
  AdmissionProgram,
  AdmissionProgramSchema,
} from './schemas/admission-program.schema';
import { AdmissionProgramsService } from './services/admission-programs.service';
import { ApplicationsModule } from 'src/applications/applications.module';
import { ExternalApplicationsModule } from 'src/external-applications/external-applications.module';
import { Application, ApplicationSchema } from 'src/applications/schemas/application.schema';
import { ExternalApplication, ExternalApplicationSchema } from 'src/external-applications/schemas/external-application.schema';
import { Program, ProgramSchema } from 'src/programs/schemas/program.schema';
import { Admission, AdmissionSchema } from 'src/admissions/schemas/admission.schema';
import { Campus, CampusSchema } from 'src/campuses/schemas/campus.schema';
import { ProgramTemplate, ProgramTemplateSchema } from 'src/program-templates/schemas/program-template.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdmissionProgram.name, schema: AdmissionProgramSchema },
      { name: Admission.name, schema: AdmissionSchema },
      { name: Campus.name, schema: CampusSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: ExternalApplication.name, schema: ExternalApplicationSchema },
      { name: Program.name, schema: ProgramSchema },
      { name: ProgramTemplate.name, schema: ProgramTemplateSchema },
    ]),
    AuthModule,
    AnalyticsModule,
    ElasticsearchModule,
    UniversityModelsModule,
  ],
  controllers: [AdmissionProgramsController],
  providers: [
    AdmissionProgramsService,
    AdmissionProgramsGateway,
    // SearchHistoryAnalyticsService  // AnalyticsModule already provides this,
  ],
  exports: [AdmissionProgramsService],
})
export class AdmissionProgramsModule { } 