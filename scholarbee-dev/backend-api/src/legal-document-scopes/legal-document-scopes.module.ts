import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LegalDocumentScope, LegalDocumentScopeSchema } from './schemas/legal-document-scope.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: LegalDocumentScope.name, schema: LegalDocumentScopeSchema },
        ]),
    ],
    exports: [MongooseModule],
})
export class LegalDocumentScopesModule { } 