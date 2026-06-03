import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';

export type LegalDocumentCategoryDocument = LegalDocumentCategory & Document;

@Schema({ timestamps: true, collection: DB_COLLECTIONS.LEGAL_DOCUMENT_CATEGORIES })
export class LegalDocumentCategory {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop()
    description?: string;
}

export const LegalDocumentCategorySchema = SchemaFactory.createForClass(LegalDocumentCategory); 