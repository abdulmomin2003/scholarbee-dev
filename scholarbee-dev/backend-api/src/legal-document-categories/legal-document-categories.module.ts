import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LegalDocumentCategory, LegalDocumentCategorySchema } from './schemas/legal-document-category.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: LegalDocumentCategory.name, schema: LegalDocumentCategorySchema },
        ]),
    ],
    exports: [MongooseModule],
})
export class LegalDocumentCategoriesModule { } 