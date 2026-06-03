import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, InferSchemaType, Types } from 'mongoose';
import { AdmissionProgram } from 'src/admission-programs/schemas/admission-program.schema';
import { Admission } from 'src/admissions/schemas/admission.schema';
import { ApplicantSnapshot } from 'src/applications/schemas/application.schema';
import { Campus } from 'src/campuses/schemas/campus.schema';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import { Program } from 'src/programs/schemas/program.schema';
import { University } from 'src/universities/schemas/university.schema';
import { User } from 'src/users/schemas/user.schema';
import { WithObjectId } from 'src/utils/db.utils';

@Schema({ timestamps: true, collection: DB_COLLECTIONS.EXTERNAL_APPLICATIONS })
export class ExternalApplication {
  @Prop({ type: Types.ObjectId, ref: Program.name, required: true })
  program: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Admission.name,
    required: true,
  })
  admission: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  applicant: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: AdmissionProgram.name, required: true })
  admission_program: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Campus.name, required: true })
  campus: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: University.name, required: true })
  university: Types.ObjectId;

  @Prop({ type: Object, required: true })
  applicant_snapshot: ApplicantSnapshot;
}

export const ExternalApplicationSchema =
  SchemaFactory.createForClass(ExternalApplication);

// export type ExternalApplicationDocument = ExternalApplication & Document;

export type ExternalApplicationDocument = WithObjectId<
  InferSchemaType<typeof ExternalApplicationSchema>
>;
