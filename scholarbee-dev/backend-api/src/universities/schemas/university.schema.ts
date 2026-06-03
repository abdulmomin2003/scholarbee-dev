import { InjectModel, MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InferSchemaType, Model, Types } from 'mongoose';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import { WithObjectId } from 'src/utils/db.utils';

/**
 * Defines the ownership / sector classification of a university.
 * This is the source of truth for the type-based filtering previously done
 * via `campus_type` on the Campus document (which is now deprecated).
 */
export enum UniversityTypeEnum {
  PRIVATE = 'private',
  GOVERNMENT = 'government',
  SEMI_GOVERNMENT = 'semi-government',
  INTERNATIONAL = 'international',
  TNI = 'tni',
}

export type UniversityDocument = WithObjectId<InferSchemaType<typeof UniversitySchema>>

@Schema({
    timestamps: true,
    collection: DB_COLLECTIONS.UNIVERSITIES,
})
export class University {
    @Prop({ required: true, unique: true })
    name: string;

    /**
     * SEO-friendly URL slug for the university
     * Format: {universityName} (e.g., "nust", "lums")
     * Automatically generated from name during creation if not provided
     * Must be unique across all universities
     */
    @Prop({ unique: true, index: true, sparse: true })
    slug: string;

    @Prop()
    abbreviation: string;

    @Prop()
    founded: Date;

    @Prop()
    description: string;

    @Prop({ type: Types.ObjectId, ref: 'Address' })
    address_id: Types.ObjectId;

    @Prop()
    website: string;

    @Prop()
    ranking: string;

    @Prop()
    affiliations: string;

    @Prop()
    motto: string;

    @Prop()
    colors: string;

    @Prop()
    mascot: string;

    @Prop({ type: String, enum: UniversityTypeEnum })
    type: UniversityTypeEnum;

    @Prop()
    total_students: number;

    @Prop()
    total_faculty: number;

    @Prop()
    total_alumni: number;

    @Prop()
    endowment: string;

    @Prop()
    campus_size: string;

    @Prop()
    annual_budget: number;

    @Prop()
    research_output: number;

    @Prop()
    international_students: number;

    @Prop()
    languages: string;

    @Prop()
    logo_url: string;

    @Prop()
    accreditations: string;

    @Prop()
    notable_alumni: string;

    // Flag to mark seed or QA-only universities that must never appear in public listings
    @Prop({ default: false })
    is_test_entity: boolean;

    @Prop({ default: false })
    allow_external_application: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;
}

export const UniversitySchema = SchemaFactory.createForClass(University);