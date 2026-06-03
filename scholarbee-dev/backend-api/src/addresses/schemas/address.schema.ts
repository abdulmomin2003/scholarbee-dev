import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InferSchemaType, Types } from 'mongoose';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import { WithObjectId } from 'src/utils/db.utils';

export type AddressDocument = WithObjectId<InferSchemaType<typeof AddressSchema>>

@Schema({ timestamps: true, collection: DB_COLLECTIONS.ADDRESSES })
export class Address {
    @Prop({ required: true })
    address_line_1: string;

    @Prop()
    address_line_2?: string;

    @Prop({ required: true })
    city: string;

    @Prop({ required: true })
    state: string;

    @Prop({ required: true })
    country: string;

    @Prop({ required: true })
    postal_code: string;

    @Prop({ required: true, type: Number })
    latitude: number;

    @Prop({ required: true, type: Number })
    longitude: number;

    @Prop({ type: Types.ObjectId })
    createdBy: Types.ObjectId;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const AddressSchema = SchemaFactory.createForClass(Address); 