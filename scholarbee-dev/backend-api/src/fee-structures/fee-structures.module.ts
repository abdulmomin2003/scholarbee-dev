import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeesController } from './controllers/fee-structure.controller';
import { FeesService } from './services/fee-structures.service';
import { FeeStructure, FeeStructureSchema } from './schemas/fee-structure.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FeeStructure.name, schema: FeeStructureSchema }
        ])
    ],
    controllers: [FeesController],
    providers: [FeesService],
    exports: [FeesService]
})
export class FeeStructuresModule { } 