import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PopulateInterceptor } from './interceptors/populate.interceptor';
import {
  University,
  UniversitySchema,
} from '../universities/schemas/university.schema';
import { Campus, CampusSchema } from '../campuses/schemas/campus.schema';
import { TestGateway } from './gateway/test.gateway';
import { RequestContextService } from './services/request-context.service';
import { MongoTransactionService } from './database/mongo-transaction.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: University.name, schema: UniversitySchema },
      { name: Campus.name, schema: CampusSchema },
    ]),
  ],
  providers: [
    PopulateInterceptor,
    TestGateway,
    RequestContextService,
    MongoTransactionService,
  ],
  exports: [PopulateInterceptor, RequestContextService, MongoTransactionService],
})
export class CommonModule { }
