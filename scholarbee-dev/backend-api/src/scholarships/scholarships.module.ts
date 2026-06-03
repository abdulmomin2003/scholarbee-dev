import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScholarshipsController } from './controllers/scholarships.controller';
import { ScholarshipsService } from './services/scholarships.service';
import { ScholarshipCronService } from './services/scholarship-cron.service';
import { Scholarship, ScholarshipSchema } from './schemas/scholarship.schema';
import {
  StudentScholarship,
  StudentScholarshipSchema,
} from 'src/student-scholarships/schemas/student-scholarship.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Scholarship.name, schema: ScholarshipSchema },
      { name: StudentScholarship.name, schema: StudentScholarshipSchema },
    ]),
  ],
  controllers: [ScholarshipsController],
  providers: [ScholarshipsService, ScholarshipCronService],
  exports: [ScholarshipsService, ScholarshipCronService],
})
export class ScholarshipsModule {}
