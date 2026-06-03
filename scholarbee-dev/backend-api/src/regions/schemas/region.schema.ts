import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InferSchemaType } from 'mongoose';
import { WithObjectId } from 'src/utils/db.utils';

export type RegionDocument = WithObjectId<InferSchemaType<typeof RegionSchema>>

@Schema({ timestamps: true })
export class Region {
    @Prop({ type: String, required: true })
    region_name: string;

    @Prop({ type: String, required: true })
    country: string;

    @Prop({ type: [String], default: [] })
    cities: string[];
}

export const RegionSchema = SchemaFactory.createForClass(Region); 