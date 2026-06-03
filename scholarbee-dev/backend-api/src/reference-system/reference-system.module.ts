import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferenceSystemController } from './controllers/reference-system.controller';
import { ReferenceSystemService } from './services/reference-system.service';
import { Referral, ReferralSchema } from './schemas/referral.schema';
import {
    ReferralUsage,
    ReferralUsageSchema,
} from './schemas/referral-usage.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Referral.name, schema: ReferralSchema },
            { name: ReferralUsage.name, schema: ReferralUsageSchema },
        ]),
    ],
    controllers: [ReferenceSystemController],
    providers: [ReferenceSystemService],
    exports: [ReferenceSystemService],
})
export class ReferenceSystemModule { }

