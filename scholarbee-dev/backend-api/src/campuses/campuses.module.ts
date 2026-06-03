import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CampusesService } from './campuses.service';
import { CampusesController } from './campuses.controller';
import { Campus, CampusSchema } from './schemas/campus.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Application, ApplicationSchema } from '../applications/schemas/application.schema';
import { Program, ProgramSchema } from '../programs/schemas/program.schema';
import { ProgramTemplate, ProgramTemplateSchema } from '../program-templates/schemas/program-template.schema';
import { University, UniversitySchema } from '../universities/schemas/university.schema';
import { Address, AddressSchema } from '../addresses/schemas/address.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UsersModule),
    MongooseModule.forFeature([
      { name: Campus.name, schema: CampusSchema },
      { name: User.name, schema: UserSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: Program.name, schema: ProgramSchema },
      { name: ProgramTemplate.name, schema: ProgramTemplateSchema },
      { name: University.name, schema: UniversitySchema },
      { name: Address.name, schema: AddressSchema },
    ]),
  ],
  controllers: [CampusesController],
  providers: [CampusesService],
  exports: [CampusesService],
})
export class CampusesModule { }
