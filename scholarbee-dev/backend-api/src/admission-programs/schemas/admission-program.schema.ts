import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, InferSchemaType, Types } from 'mongoose';
import { Admission } from 'src/admissions/schemas/admission.schema';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import { Program } from 'src/programs/schemas/program.schema';
import { User } from 'src/users/schemas/user.schema';
import { WithObjectId } from 'src/utils/db.utils';

/** CMS-stored publication status for the admission program document. */
export enum AdmissionProgramCmsStatusEnum {
  Draft = 'draft',
  Inherit = 'inherit',
}

/** CMS-stored receiving_applications value for the admission program document. */
export enum AdmissionProgramReceivingApplicationsEnum {
  True = 'true',
  False = 'false',
  Inherit = 'inherit',
}


interface AdmissionRequirementValue {
  children: Array<{
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    text?: string;
    type?: string;
    children?: any[];
    url?: string;
    newTab?: boolean;
    code?: boolean;
  }>;
  type?: string;
}

interface AdmissionRequirement {
  id: string;
  key: string;
  value: AdmissionRequirementValue[];
}

@Schema({ timestamps: true, collection: DB_COLLECTIONS.ADMISSION_PROGRAMS })
export class AdmissionProgram {
  @Prop({ type: Types.ObjectId, ref: Admission.name })
  admission: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(AdmissionProgramCmsStatusEnum) })
  status?: AdmissionProgramCmsStatusEnum;

  /**
   * SEO-friendly URL slug for the admission program
   * Format: {admissionTitle}-{programName}-{campusName}
   * Example: "fall-2026-computer-science-main-campus"
   * Automatically generated during creation if not provided
   * Must be unique across all admission programs
   */
  @Prop({ unique: true, index: true, sparse: true })
  slug: string;

  @Prop({ type: String })
  admission_fee: string;

  @Prop({
    type: [
      {
        id: { type: String, required: true },
        key: { type: String, required: true },
        value: { type: Array, required: true },
      },
    ],
  })
  admission_requirements: AdmissionRequirement[];

  @Prop({ type: Number, required: true })
  available_seats: number;

  @Prop({ type: Date })
  created_at: Date;

  @Prop({ type: Types.ObjectId, ref: User.name })
  createdBy: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], default: [], ref: User.name })
  favouriteBy: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: Program.name, required: true })
  program: Types.ObjectId;

  @Prop({ type: String })
  redirect_deeplink: string;

  @Prop({ type: String })
  _redirect_deepink: string;

  @Prop({ type: [Types.ObjectId], default: [], ref: User.name })
  redirected_students: Types.ObjectId[];

  /**
   * Controls whether this specific admission program is currently accepting new applications.
   * - `'true'`    → always accept, regardless of the parent admission session's setting
   * - `'false'`   → always reject; `createApplicationDraft` will throw a 400
   * - `'inherit'` (or missing/null) → follow the parent admission session's receiving_applications
   *
   * Stored as a string by the CMS (not a boolean). Managed from the CMS.
   */
  @Prop({ type: String, enum: Object.values(AdmissionProgramReceivingApplicationsEnum), default: AdmissionProgramReceivingApplicationsEnum.Inherit })
  receiving_applications?: AdmissionProgramReceivingApplicationsEnum;
}

export const AdmissionProgramSchema =
  SchemaFactory.createForClass(AdmissionProgram);


export type AdmissionProgramDocument = WithObjectId<InferSchemaType<typeof AdmissionProgramSchema>>