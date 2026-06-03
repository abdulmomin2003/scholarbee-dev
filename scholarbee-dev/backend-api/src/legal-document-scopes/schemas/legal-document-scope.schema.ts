import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';

export type LegalDocumentScopeDocument = LegalDocumentScope & Document;

@Schema({ timestamps: true, collection: DB_COLLECTIONS.LEGAL_DOCUMENT_SCOPES })
export class LegalDocumentScope {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop()
    description?: string;
}

export const LegalDocumentScopeSchema = SchemaFactory.createForClass(LegalDocumentScope); 