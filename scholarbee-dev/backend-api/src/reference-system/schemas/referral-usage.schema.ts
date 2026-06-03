import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import { Referral } from 'src/reference-system/schemas/referral.schema';
import { User } from 'src/users/schemas/user.schema';

export type ReferralUsageDocument = ReferralUsage & Document<Types.ObjectId>;

export enum ConsumerType {
    User = 'user',
}

@Schema({ collection: DB_COLLECTIONS.REFERRAL_USAGES })
export class ReferralUsage {
    @Prop({
        type: Types.ObjectId,
        ref: Referral.name,
        required: true,
    })
    referral_id: Types.ObjectId;

    @Prop({
        type: String,
        enum: ConsumerType,
        default: ConsumerType.User,
        required: true,
    })
    consumer_type: ConsumerType;

    @Prop({
        type: Types.ObjectId,
        ref: User.name,
        required: true,
    })
    consumer_id: Types.ObjectId;
}

export const ReferralUsageSchema = SchemaFactory.createForClass(ReferralUsage);

// Add index on referral_id for faster lookups
ReferralUsageSchema.index({ referral_id: 1 });

// Add index on consumer_id for faster lookups
ReferralUsageSchema.index({ consumer_id: 1 });


ReferralUsageSchema.index(
    { referral_id: 1, consumer_id: 1 },
    { unique: true }
);
