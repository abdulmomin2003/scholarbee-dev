import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RootFilterQuery } from 'mongoose';
import { BetterOmit } from 'src/utils/typescript.utils';
import { QueryLegalDocumentsDto } from './dto/query-legal-documents.dto';
import {
  LegalDocument,
  LegalDocumentDocument,
  LegalDocumentType,
} from './schemas/legal-document.schema';
import { LegalDocumentRequirementsService } from '../legal-document-requirements/legal-document-requirements.service';

@Injectable()
export class LegalDocumentsService {
  constructor(
    @InjectModel(LegalDocument.name)
    private legalDocumentModel: Model<LegalDocumentDocument>,
    private legalDocumentRequirementsService: LegalDocumentRequirementsService,
  ) {}

  async findAll(
    queryDto: QueryLegalDocumentsDto,
  ): Promise<BetterOmit<LegalDocument, 'content'>[]> {
    const filter: RootFilterQuery<LegalDocument> = {};

    // STEP 1: Handle applicable_on filter with precedence
    // If applicable_on is provided, it defines the base set of required document types
    if (queryDto.applicable_on) {
      try {
        const requirement =
          await this.legalDocumentRequirementsService.findByActionType(
            queryDto.applicable_on,
          );

        // EDGE CASE 1: No requirement found or empty required_document_types
        // Return empty array as requested
        if (
          !requirement ||
          !requirement.required_document_types ||
          requirement.required_document_types.length === 0
        ) {
          return [];
        }

        const requiredDocTypes = new Set(requirement.required_document_types);

        // STEP 2: If document_type or document_types is also provided,
        // narrow down to intersection (not union)
        if (queryDto.document_type && queryDto.document_types) {
          throw new BadRequestException(
            'Cannot provide both document_type and document_types',
          );
        }

        if (queryDto.document_type) {
          // Check if requested type is in required types
          if (!requiredDocTypes.has(queryDto.document_type)) {
            // Type not in required types - return empty array
            return [];
          }
          filter.document_type = queryDto.document_type;
        } else if (queryDto.document_types) {
          // Intersection: only include types that are in both required and provided types
          const intersection = queryDto.document_types.filter((dt) =>
            requiredDocTypes.has(dt),
          );

          // EDGE CASE 2: No overlap between required and provided types
          if (intersection.length === 0) {
            return [];
          }

          filter.document_type = { $in: intersection };
        } else {
          // No additional type filter, use all required types from applicable_on
          filter.document_type = { $in: Array.from(requiredDocTypes) };
        }
      } catch (error) {
        // If there's a service error, log it and return empty array
        // (applicable_on is a strict requirement)
        console.error(
          `Error fetching requirement for applicable_on=${queryDto.applicable_on}:`,
          error,
        );
        return [];
      }
    } else {
      // STEP 3: No applicable_on - use original logic (backward compatible)
      // Cannot provide both document_type and document_types
      if (queryDto.document_type && queryDto.document_types) {
        throw new BadRequestException(
          'Cannot provide both document_type and document_types',
        );
      }

      // Filter by document type if provided
      if (queryDto.document_type) {
        filter.document_type = queryDto.document_type;
      }
      // Filter by document types if provided
      else if (queryDto.document_types) {
        filter.document_type = { $in: queryDto.document_types };
      }
    }

    // STEP 4: Apply status filter if provided
    // Status filter is independent and applied in addition to document type filters
    if (queryDto.status) {
      filter.status = queryDto.status;
    }

    // STEP 5: Apply document IDs filter if provided
    // Document ID filter is independent and acts as additional constraint
    if (queryDto.document_ids) {
      filter._id = { $in: queryDto.document_ids };
    }

    // STEP 6: Execute query and return results (excluding content field for performance)
    const results = await this.legalDocumentModel
      .find<LegalDocument>(filter)
      .select<BetterOmit<LegalDocument, 'content'>>('-content')
      .exec();

    return results;
  }

  async findById(id: string): Promise<LegalDocument | null> {
    const document = await this.legalDocumentModel.findById(id).exec();
    console.log('🚀 ~ LegalDocumentsService ~ findById ~ document:', document);
    if (!document) {
      throw new NotFoundException('Legal document not found');
    }
    return document;
  }
}
