import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InferSchemaType, Types } from 'mongoose';
import { AdmissionProgram } from 'src/admission-programs/schemas/admission-program.schema';
import { Campus } from 'src/campuses/schemas/campus.schema';
import { LivingStatusEnum } from 'src/common/constants/shared.constants';
import { LegalDocument } from 'src/legal-documents/schemas/legal-document.schema';
import { Program } from 'src/programs/schemas/program.schema';
import { WithObjectId } from 'src/utils/db.utils';
import {
  EducationalBackground,
  NationalIdCard,
  User,
  UserNS,
} from '../../users/schemas/user.schema';

interface IApplicantSnapshot {
  first_name: string; // required
  last_name: string; // required
  email: string; // required
  phone_number: string; // required
  date_of_birth: Date; // required
  gender: string; // required
  nationality?: string; // optional
  profile_image_url?: string; // optional
  city: string; // required
  stateOrProvince: string; // required
  streetAddress: string; // required
  postalCode: string; // required
  districtOfDomicile: string; // required
  provinceOfDomicile: UserNS.ProvinceOfDomicile; // required
  father_name?: string;
  father_status?: string;
  father_profession?: string;
  father_income?: string;
  religion?: string;
  special_person: string; // required
  educational_backgrounds: EducationalBackground[]; // required
  national_id_card: NationalIdCard; // required
  user_type: string; // required
  /** Marketing/support student identifier (e.g. SB_000000001), copied from user at submit. */
  student_id?: string;
}

@Schema({
  timestamps: false,
  _id: false,
})
export class ApplicantSnapshot implements IApplicantSnapshot /* Optional */ {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true })
  full_name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone_number: string;

  @Prop({ required: true })
  date_of_birth: Date;

  @Prop({ required: false })
  father_name?: string;

  @Prop({ required: false })
  father_profession?: string;

  @Prop({
    type: String,
    enum: LivingStatusEnum,
    required: false,
  })
  father_status?: LivingStatusEnum;

  @Prop({ required: false })
  father_income?: string;

  @Prop({ required: false })
  religion?: string;

  @Prop({ enum: ['yes', 'no'], required: true })
  special_person: string;

  @Prop({ enum: ['Male', 'Female', 'Other'], required: true })
  gender: string;

  @Prop({ required: false })
  nationality?: string;

  @Prop({ type: String, enum: UserNS.ProvinceOfDomicile, required: true })
  provinceOfDomicile: UserNS.ProvinceOfDomicile;

  @Prop({ required: true })
  districtOfDomicile: string;

  @Prop({ required: true })
  stateOrProvince: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  postalCode: string;

  @Prop({ required: true })
  streetAddress: string;

  @Prop({ required: false })
  profile_image_url?: string;

  @Prop({ required: true, enum: UserNS.UserType })
  user_type: UserNS.UserType;

  @Prop({ type: [EducationalBackground], required: true })
  educational_backgrounds: EducationalBackground[];

  @Prop({ type: NationalIdCard, required: true })
  national_id_card: NationalIdCard;

  @Prop({ required: false })
  student_id?: string;
}

interface Preference {
  program: Types.ObjectId;
  preference_order: string;
}

interface IDepartment {
  department: string;
  preferences: Preference[];
}

export enum ApplicationStatus {
  /**
   * Draft status is used to indicate that the application is in draft mode and is (created but) not submitted by the user
   */
  DRAFT = 'Draft',

  /**
   * Pending status is used to indicate that the application is submitted by the user and is pending for approval
   */
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  UNDER_REVIEW = 'Under Review',
}

@Schema({ timestamps: true })
export class Application {
  /**
   * @deprecated Use program instead
   */
  @Prop({ type: Types.ObjectId, ref: Program.name, required: false })
  program_id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Admission',
    required: true,
  })
  admission_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  applicant: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: AdmissionProgram.name, required: true })
  admission_program_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Campus.name, required: true })
  campus_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Program.name, required: true })
  program: Types.ObjectId;

  @Prop({ type: Date, required: true })
  submission_date: Date;

  @Prop({
    type: String,
    enum: ApplicationStatus,
    default: ApplicationStatus.DRAFT,
  })
  status: ApplicationStatus;

  @Prop({ type: Number, required: true })
  total_processing_fee: number;

  @Prop({ type: ApplicantSnapshot, required: false })
  applicant_snapshot?: ApplicantSnapshot;


  /* 
  TODO: Not yet implemented: Review if the change will cause any ripples in the existing code. This should replace the departments schema.
  {
    academic_department?: Types.ObjectId | string;
    admission_program?: Types.ObjectId | string;
    order?: number; // This might not be required, since order is already maintained in the array of preferences
  }[]
   */
  preferences?: {
    academic_department?: Types.ObjectId | string;
    admission_program?: Types.ObjectId | string;
    order?: number; // This might not be required, since order is already maintained in the array of preferences
  }[]

  //   An array of legal document ids that the applicant has accepted
  //   Ref: LegalDocument
  @Prop({
    type: [Types.ObjectId],
    default: [],
    required: false,
    ref: LegalDocument.name,
  })
  accepted_legal_documents?: Types.ObjectId[];

  // Refactor this to a nested schema
  @Prop({
    // type: [Department],
    type: [
      {
        // id: String,
        department: String,
        preferences: [
          {
            program: { type: Types.ObjectId, ref: AdmissionProgram.name },
            preference_order: String,
          },
        ],
      },
    ],
  })
  departments: IDepartment[];
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

export type ApplicationDocument = WithObjectId<
  InferSchemaType<typeof ApplicationSchema>
>;
