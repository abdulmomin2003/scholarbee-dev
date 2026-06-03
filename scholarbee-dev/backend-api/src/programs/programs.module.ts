import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsModule } from 'src/analytics/analytics.module';
import { ElasticsearchModule } from 'src/elasticsearch/elasticsearch.module';
import { UniversityModelsModule } from 'src/universities/university-models.module';
import { AdmissionProgram, AdmissionProgramSchema } from 'src/admission-programs/schemas/admission-program.schema';
import { Admission, AdmissionSchema } from 'src/admissions/schemas/admission.schema';
import { Campus, CampusSchema } from 'src/campuses/schemas/campus.schema';
import { ProgramsController } from './controllers/programs.controller';
import { Program, ProgramSchema } from './schemas/program.schema';
import { ProgramsService } from './services/programs.service';
import { ProgramTemplate, ProgramTemplateSchema } from 'src/program-templates/schemas/program-template.schema';

@Module({
  imports: [
    AnalyticsModule,
    ElasticsearchModule,
    UniversityModelsModule,
    MongooseModule.forFeature([
      { name: Program.name, schema: ProgramSchema },
      { name: AdmissionProgram.name, schema: AdmissionProgramSchema },
      { name: Admission.name, schema: AdmissionSchema },
      { name: Campus.name, schema: CampusSchema },
      { name: ProgramTemplate.name, schema: ProgramTemplateSchema },
    ]),
  ],
  controllers: [ProgramsController],
  providers: [
    ProgramsService,
  ],
  exports: [ProgramsService],
})
export class ProgramsModule { }
