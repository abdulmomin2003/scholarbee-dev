import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, InferSchemaType, Schema as MongooseSchema, Types } from 'mongoose';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';

// Fee Type Enum
export enum FeeType {
  TUITION = 'tuition',
  APPLICATION = 'application',
  ADMISSION = 'admission',
  REGISTRATION = 'registration',
  LAB = 'lab',
  CLINICAL = 'clinical',
  TECHNOLOGY = 'technology',
  LIBRARY = 'library',
  HEALTH_SERVICES = 'health_services',
  ORIENTATION = 'orientation',
  GRADUATION = 'graduation',
  INTERNATIONAL = 'international',
  PARKING = 'parking',
  HEALTH_INSURANCE = 'health_insurance',
  OTHER = 'other',
}

// Payment Type Enum (at fee item level)
export enum PaymentType {
  RECURRING = 'recurring',
  ONE_TIME = 'one_time',
}

// Semester Applicability Enum
export enum SemesterApplicability {
  ALL_SEMESTERS = 'all_semesters',
  FIRST_SEMESTER_ONLY = 'first_semester_only',
  LAST_SEMESTER_ONLY = 'last_semester_only',
  SPECIFIC_SEMESTERS = 'specific_semesters',
  NOT_SEMESTER_SPECIFIC = 'not_semester_specific', // For one-time fees not tied to any semester
  ALL_SEMESTERS_EXCEPT_FIRST = 'all_semesters_except_first', // All semesters except the first
  ALL_SEMESTERS_EXCEPT_LAST = 'all_semesters_except_last', // All semesters except the last
}

// Migration Status Enum
export enum MigrationStatus {
  MIGRATED = 'migrated',
  REVIEWED = 'reviewed',
  COMPLETE = 'complete',
}

// Fee Type Display Names (for UI and default names)
export const FeeTypeDisplayNames: Record<FeeType, string> = {
  [FeeType.TUITION]: 'Tuition Fee',
  [FeeType.APPLICATION]: 'Application Fee',
  [FeeType.ADMISSION]: 'Admission Fee',
  [FeeType.REGISTRATION]: 'Registration Fee',
  [FeeType.LAB]: 'Lab Fee',
  [FeeType.CLINICAL]: 'Clinical Fee',
  [FeeType.TECHNOLOGY]: 'Technology Fee',
  [FeeType.LIBRARY]: 'Library Fee',
  [FeeType.HEALTH_SERVICES]: 'Health Services Fee',
  [FeeType.ORIENTATION]: 'Orientation Fee',
  [FeeType.GRADUATION]: 'Graduation Fee',
  [FeeType.INTERNATIONAL]: 'International Student Fee',
  [FeeType.PARKING]: 'Parking Fee',
  [FeeType.HEALTH_INSURANCE]: 'Health Insurance Fee',
  [FeeType.OTHER]: 'Other Fee',
};

// Fee Item Schema
const FeeItemSchema = new MongooseSchema(
  {
    type: {
      type: String,
      enum: Object.values(FeeType),
      required: true,
    },
    name: {
      type: String,
      required: false,
    }, // Optional, but required when type is OTHER (validate in DTO/service layer)
    description: {
      type: String,
      required: false,
    }, // Optional, used for tooltips/help text
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: false,
    }, // Override default currency if needed
    payment_type: {
      type: String,
      enum: Object.values(PaymentType),
      required: true,
    }, // recurring or one_time
    semester_applicability: {
      type: String,
      enum: Object.values(SemesterApplicability),
      required: true,
    },
    specific_semesters: {
      type: [Number],
      required: false,
    }, // If SPECIFIC_SEMESTERS, list of semester numbers [1, 3, 5]
    residency_applicability: {
      type: String,
      enum: ['national', 'international', 'both'],
      default: 'both',
    }, // Flattened from applicable_to.residency_status
    enrollment_applicability: {
      type: String,
      enum: ['full_time', 'part_time', 'both'],
      default: 'both',
    }, // Flattened from applicable_to.student_category
    is_mandatory: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

export type IFeeItem = InferSchemaType<typeof FeeItemSchema>;

export type FeeStructureDocument = FeeStructure & Document;

@Schema({ timestamps: true, collection: DB_COLLECTIONS.FEE_STRUCTURES })
export class FeeStructure {
  @Prop({ type: String, required: true })
  title: string;

  // Legacy fields (kept for backward compatibility during migration)
  @Prop({ type: Number, required: false })
  tuition_fee?: number;

  @Prop({ type: Number, required: false })
  application_fee?: number;

  @Prop({ type: String, required: false })
  currency?: string;

  @Prop({ type: String, required: false })
  payment_schedule?: string; // Describes university's payment cycle (e.g., "per semester", "per academic year")

  @Prop({ type: Number, required: false, default: 8 })
  total_semesters?: number; // Total number of semesters for this program (used for fee calculations and semester selection)

  @Prop({
    type: [
      {
        fee_name: { type: String, required: true },
        fee_amount: { type: Number, required: true },
        include_in_first_semester: { type: Boolean, default: false },
      },
    ],
    required: false,
    default: [],
  })
  other_fees?: {
    fee_name: string;
    fee_amount: number;
    include_in_first_semester?: boolean;
  }[];

  // New fields
  @Prop({ type: [FeeItemSchema], required: false, default: [] })
  fees?: IFeeItem[];

  @Prop({ type: [String], required: false })
  _info_source?: string[]; // Array of URL strings for data source

  @Prop({
    type: String,
    enum: Object.values(MigrationStatus),
    required: false,
  })
  _migration_status?: MigrationStatus;

  @Prop({ type: Boolean, required: false, default: false })
  _needs_review?: boolean; // Flag for ambiguous structures requiring team review

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdBy?: Types.ObjectId;
}

export const FeeStructureSchema = SchemaFactory.createForClass(FeeStructure);
