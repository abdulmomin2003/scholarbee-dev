import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReferralDocument = Referral & Document<Types.ObjectId>;

export enum ReferralType {
    Invitation = 'invitation',
    Promo = 'promo',
}

@Schema({ collection: 'referrals' })
export class Referral {
    @Prop({ required: true, unique: true })
    code: string;

    @Prop({ required: true, unique: true })
    title: string;

    @Prop({
        type: String,
        enum: ReferralType,
        required: true,
    })
    type: ReferralType;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    })
    owner_id: Types.ObjectId;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);

// Add index on code for faster lookups
ReferralSchema.index({ code: 1 });

