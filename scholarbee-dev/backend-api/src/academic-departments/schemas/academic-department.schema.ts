import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, InferSchemaType, Schema as MongooseSchema } from 'mongoose';
import { Campus } from '../../campuses/schemas/campus.schema';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import { WithObjectId } from 'src/utils/db.utils';


@Schema({ timestamps: true, collection: DB_COLLECTIONS.ACADEMIC_DEPARTMENTS })
export class AcademicDepartment {
    @Prop({ required: true })
    name: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Campus' })
    campus_id: MongooseSchema.Types.ObjectId | string;

    @Prop()
    contact_phone: string;

    @Prop()
    contact_email: string;

    @Prop()
    head_of_department: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    createdBy: MongooseSchema.Types.ObjectId | string;
}

export const AcademicDepartmentSchema = SchemaFactory.createForClass(AcademicDepartment);
export type AcademicDepartmentDocument = WithObjectId<InferSchemaType<typeof AcademicDepartmentSchema>>;