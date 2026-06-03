import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExternalApplicationsService } from './external-applications.service';
import { ExternalApplicationsController } from './external-applications.controller';
import {
  ExternalApplication,
  ExternalApplicationSchema,
} from './schemas/external-application.schema';
import {
  AdmissionProgram,
  AdmissionProgramSchema,
} from '../admission-programs/schemas/admission-program.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { UsersModule } from 'src/users/users.module';
import { ProgramTemplate, ProgramTemplateSchema } from 'src/program-templates/schemas/program-template.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExternalApplication.name, schema: ExternalApplicationSchema },
      { name: AdmissionProgram.name, schema: AdmissionProgramSchema },
      { name: User.name, schema: UserSchema },
      { name: ProgramTemplate.name, schema: ProgramTemplateSchema },
    ]),
    UsersModule,
  ],
  controllers: [ExternalApplicationsController],
  providers: [ExternalApplicationsService],
  exports: [ExternalApplicationsService],
})
export class ExternalApplicationsModule {}
