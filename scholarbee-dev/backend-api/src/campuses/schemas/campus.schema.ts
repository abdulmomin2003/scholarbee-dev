import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InferSchemaType, Types } from 'mongoose';
import { Address } from 'src/addresses/schemas/address.schema';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import { University } from 'src/universities/schemas/university.schema';
import { WithObjectId } from 'src/utils/db.utils';

/**
 * @deprecated Use university `type` field instead.
 * This enum will be removed in a future release.
 */
export enum CampusTypeEnum {
  PRIVATE = 'private',
  SUPPORT = 'support',
  GOVERNMENT = 'government',
  SEMI_GOVERNMENT = 'semi-government',
  INTERNATIONAL_UNIVERSITIES = 'international',
  TNI = 'tni',
}

// Todo: Have to allow the test and support campuses to display when different envirements are used.
/**
 * Describes the operational role of a campus document.
 * - PUBLIC  : a real, publicly listed campus (default)
 * - TEST    : a seed / QA-only campus — never shown in public listings
 * - SUPPORT : the internal ScholarBee support campus used for support chat
 *
 * Replaces the boolean `is_test_entity` flag and the `campus_type: 'support'` convention.
 */
export enum CampusEntityTypeEnum {
  PUBLIC = 'public',
  TEST = 'test',
  SUPPORT = 'support',
}


@Schema({
  timestamps: true,
  collection: DB_COLLECTIONS.CAMPUSES,
})
export class Campus {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, index: true, sparse: true })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: University.name })
  university_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Address.name })
  address_id: Types.ObjectId;

  /**
   * Operational role of this campus document.
   * Defaults to PUBLIC. Missing / null values are treated as PUBLIC.
   * Replaces `is_test_entity` (boolean) and the `campus_type: 'support'` convention.
   */
  @Prop({ type: String, enum: CampusEntityTypeEnum, default: CampusEntityTypeEnum.PUBLIC })
  entity_type: CampusEntityTypeEnum;

  /**
   * @deprecated Use the `type` field on the associated University document instead.
   * This field will be removed in a future release.
   * Kept temporarily to avoid a breaking change.
   */
  // Private, Government, Semi-Government, International Universities, or TNI
  @Prop({ type: String, enum: CampusTypeEnum })
  campus_type?: CampusTypeEnum;

  @Prop()
  established_date: Date;

  @Prop()
  campus_area: number;

  @Prop()
  website: string;

  @Prop()
  contact_phone: string;

  @Prop()
  contact_email: string;

  @Prop()
  logo_url: string;

  @Prop({ default: false })
  scholarbee_verified: boolean;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  @Prop()
  student_population: number;

  @Prop({ default: 7 })
  level: number;

  @Prop({ default: true })
  library_facilities: boolean;

  @Prop({ default: true })
  sports_facilities: boolean;

  @Prop({ default: true })
  dining_options: boolean;

  @Prop({ default: true })
  transportation_options: boolean;

  @Prop({ default: true })
  residential_facilities: boolean;

  @Prop({ default: true })
  healthcare_facilities: boolean;

  @Prop({ default: true })
  parking_facilities: boolean;

  @Prop({ default: true })
  security_features: boolean;

  @Prop()
  facilities: string;

  @Prop()
  accreditations: string;

  @Prop({ default: false })
  is_primary: boolean;

  @Prop({ type: [{ url: { type: String, required: true } }], default: [] })
  pictures: { url: string }[];

  @Prop()
  faculty_count: number;

  /**
   * @deprecated Use `entity_type: CampusEntityTypeEnum.TEST` instead.
   * This field will be removed in a future release once all existing documents are migrated.
   */
  // Flag to mark seed or QA-only campuses that must never appear in public listings
  @Prop({ default: false })
  is_test_entity: boolean;

  // Flag to mark campuses as partners for homepage display
  @Prop({ default: false })
  is_partner: boolean;

  @Prop({ type: Types.ObjectId, ref: DB_COLLECTIONS.USERS })
  createdBy: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], default: [], ref: DB_COLLECTIONS.USERS })
  favouriteBy: Types.ObjectId[];
}

export const CampusSchema = SchemaFactory.createForClass(Campus);

// Compound unique index for support campuses to prevent duplicates.
// Uses entity_type (replacing the deprecated campus_type: 'support' convention).
CampusSchema.index(
  { entity_type: 1, contact_email: 1 },
  {
    unique: true,
    partialFilterExpression: { entity_type: CampusEntityTypeEnum.SUPPORT },
    name: 'unique_support_campus_v2',
  }
);

export type CampusDocument = WithObjectId<InferSchemaType<typeof CampusSchema>>;
