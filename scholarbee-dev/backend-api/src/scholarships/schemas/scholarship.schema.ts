import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InferSchemaType, Types } from 'mongoose';
import {
  DegreeLevelEnum,
  ScholarshipLocationEnum,
  ScholarshipStatusEnum,
  ScholarshipTypeEnum,
} from 'src/common/constants/shared.constants';
import { OrganizationDocument } from 'src/organizations/schemas/organization.schema';
import { RegionDocument } from 'src/regions/schemas/region.schema';
import { UniversityDocument } from 'src/universities/schemas/university.schema';
import { WithObjectId } from 'src/utils/db.utils';
import { BetterOmit, PopulateRefs } from 'src/utils/typescript.utils';

export type ScholarshipDocument = PopulateRefs<
  WithObjectId<InferSchemaType<typeof ScholarshipSchema>>,
  {
    university_id: UniversityDocument;
    region: RegionDocument;
    organization_id: OrganizationDocument;
  }
>

@Schema({ timestamps: false, _id: false })
class ScholarshipRequiredDocument {
  @Prop({ type: String, required: true })
  id: string;
  @Prop({ type: String, required: true })
  document_name: string;
}

@Schema({ timestamps: true, collection: 'scholarships', _id: true })
export class Scholarship {

  @Prop({ type: String, required: true })
  scholarship_name: string;

  @Prop({ type: String, required: true })
  scholarship_description: string;

  @Prop({
    type: String,
    enum: ScholarshipTypeEnum,
    default: ScholarshipTypeEnum.Merit,
  })
  scholarship_type: ScholarshipTypeEnum;

  @Prop({
    type: String,
    enum: ScholarshipLocationEnum,
    default: ScholarshipLocationEnum.Local,
  })
  location: ScholarshipLocationEnum;

  @Prop({ type: Date, required: true })
  application_opening_date: Date;

  @Prop({ type: String, enum: DegreeLevelEnum, required: true })
  degree_level: DegreeLevelEnum;

  @Prop({ type: Number, default: 0 })
  amount: number;

  @Prop({ type: Date, required: true })
  application_deadline: Date;

  @Prop({ type: String })
  application_link?: string;

  @Prop({ type: String })
  application_process?: string;

  @Prop({ type: String, required: false })
  eligibility_criteria: string;

  @Prop({ type: [ScholarshipRequiredDocument], default: [], required: false })
  required_documents: ScholarshipRequiredDocument[];

  @Prop({
    type: String,
    enum: ScholarshipStatusEnum,
    default: ScholarshipStatusEnum.Open,
  })
  status: ScholarshipStatusEnum;

  @Prop({ type: [Types.ObjectId], ref: 'Campus', default: [], required: false })
  campus_ids: Types.ObjectId[];

  @Prop({
    type: Types.ObjectId,
    ref: 'University',
    required: false,
  })
  university_id: Types.ObjectId;

  @Prop({ type: Number, default: 0, required: false })
  rating?: number;

  @Prop({ type: String, required: false })
  major?: string;

  @Prop({ type: Types.ObjectId, ref: 'Region' })
  region?: Types.ObjectId;

  @Prop({ type: String })
  image_url?: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Organization',
    required: true,
  })
  organization_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  createdBy: string;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  favouriteBy: Types.ObjectId[];
}

export const ScholarshipSchema = SchemaFactory.createForClass(Scholarship);


export const ScholarshipModelFeature = MongooseModule.forFeature([
  { name: Scholarship.name, schema: ScholarshipSchema },
]);