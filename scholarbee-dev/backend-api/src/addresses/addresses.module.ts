import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { Address, AddressSchema } from './schemas/address.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Campus, CampusSchema } from '../campuses/schemas/campus.schema';
import { UsersModule } from '../users/users.module';
import { UniversitiesModule } from '../universities/universities.module';
import { CampusesModule } from '../campuses/campuses.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Address.name, schema: AddressSchema },
            { name: User.name, schema: UserSchema },
            { name: Campus.name, schema: CampusSchema },
        ]),
        UsersModule,
        UniversitiesModule,
        CampusesModule,
    ],
    controllers: [AddressesController],
    providers: [AddressesService],
    exports: [AddressesService],
})
export class AddressesModule { } 