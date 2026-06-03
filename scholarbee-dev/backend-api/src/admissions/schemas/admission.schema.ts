import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, InferSchemaType } from 'mongoose';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';

/**
 * Defines the allowed terms/seasons for an admission session.
 * This prevents data anomalies like 'Autumn' vs 'Fall' or casing issues.
 */
export enum AdmissionSessionEnum {
  FALL = 'fall',
  SPRING = 'spring',
  SUMMER = 'summer',
  WINTER = 'winter',
}

/**
 * This enum is used to define the status of the `admission_program` which is 1-1 mapped with the `admission` document.
 * Even though this is a property of the `admission_program` document, it is defined in the `admission` schema because it is dependent on the fields of the `admission` document i.e. `admission_deadline`.
 * ? This can be used to query the `universities` or `campuses` according to the status of the `admission_program` associated with them.
 */
export enum AdmissionStatusEnum {
  AVAILABLE = 'available', // if the admission (admission_program) is available
  UNAVAILABLE = 'unavailable', // if the admission (admission_program) is unavailable
  // ! Temporarily commented out because the admission_program_status is not supported in the findAll method of the universities controller
  // OPEN = 'open', // available and not past admission deadline
  // CLOSED = 'closed', // available but past admission deadline
}

/** CMS-stored publication status for the admission session document. */
export enum AdmissionCmsStatusEnum {
  Draft = 'draft',
  Published = 'published',
}

export type AdmissionDocument = InferSchemaType<typeof AdmissionSchema>;

@Schema({ timestamps: true, collection: DB_COLLECTIONS.ADMISSIONS })
export class Admission {
  @Prop({
    type: [
      {
        id: { type: String, required: true },
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
  })
  admission_announcements: Array<{
    id: string;
    key: string;
    value: string;
  }>;

  @Prop({ type: Date, required: false })
  admission_deadline: Date;

  @Prop({ type: String })
  admission_description: string;

  @Prop({ type: Date })
  admission_startdate: Date;

  @Prop({ type: String, required: true })
  admission_title: string;

  @Prop({ type: String, enum: Object.values(AdmissionSessionEnum), required: true })
  session_term: AdmissionSessionEnum;

  @Prop({ type: Number, required: true })
  session_year: number;

  @Prop({ type: Number })
  available_seats: number;

  @Prop({ type: String, enum: Object.values(AdmissionCmsStatusEnum) })
  status?: AdmissionCmsStatusEnum;

  @Prop({ type: Boolean, default: true })
  receiving_applications?: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Campus', required: true })
  campus_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date })
  created_at: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  poster: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'University',
    required: true,
  })
  university_id: MongooseSchema.Types.ObjectId;
}

export const AdmissionSchema = SchemaFactory.createForClass(Admission);