import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types, SortOrder } from 'mongoose';
import { ProgramTemplate, ProgramTemplateDocument } from '../schemas/program-template.schema';
import { CreateProgramTemplateDto } from '../dto/create-program-template.dto';
import { QueryProgramTemplateDto } from '../dto/query-program-template.dto';
import { QueryFieldsOfStudyDto } from '../dto/query-fields-of-study.dto';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';

@Injectable()
export class ProgramTemplatesService {
    constructor(
        @InjectModel(ProgramTemplate.name) private programTemplateModel: Model<ProgramTemplateDocument>
    ) { }

    async create(createProgramTemplateDto: CreateProgramTemplateDto): Promise<ProgramTemplateDocument> {
        try {
            const createdTemplate = new this.programTemplateModel(createProgramTemplateDto);
            return await createdTemplate.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new BadRequestException('Program template already exists');
            }
            if (error.name === 'ValidationError') {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }

    async findAll(queryDto: QueryProgramTemplateDto): Promise<{ data: ProgramTemplateDocument[], meta: any }> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search,
            name,
            degree_level,
            field_of_study,
            seo_title_key,
            tags,
        } = queryDto;

        const skip = (page - 1) * limit;
        const sortOptions: Record<string, SortOrder> = { [sortBy]: sortOrder as SortOrder };

        // Build filter
        const filter: any = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { degree_level: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { field_of_study: { $regex: search, $options: 'i' } },
                { seo_title_key: { $regex: search, $options: 'i' } }
            ];
        }

        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }

        if (degree_level) {
            filter.degree_level = { $regex: degree_level, $options: 'i' };
        }

        if (field_of_study) {
            filter.field_of_study = { $regex: field_of_study, $options: 'i' };
        }

        if (seo_title_key) {
            filter.seo_title_key = { $regex: seo_title_key, $options: 'i' };
        }

        if (tags && tags.length > 0) {
            filter.tags = { $in: tags.map(t => new RegExp(t, 'i')) };
        }

        try {
            const [data, total] = await Promise.all([
                this.programTemplateModel.find(filter)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit)
                    .exec(),
                this.programTemplateModel.countDocuments(filter)
            ]);

            return {
                data,
                meta: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            throw new BadRequestException(`Error fetching program templates: ${error.message}`);
        }
    }

    async findOne(id: string): Promise<ProgramTemplateDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid program template ID');
        }

        const template = await this.programTemplateModel.findById(id).exec();

        if (!template) {
            throw new NotFoundException(`Program template with ID ${id} not found`);
        }

        return template;
    }

    async findAllFieldsOfStudy(queryDto: QueryFieldsOfStudyDto = {}): Promise<string[]> {
        const { admission_programs_available } = queryDto;

        // Fast path: when no filter is requested we skip any join and run a
        // single distinct() on the ProgramTemplate collection. This is the
        // cheapest possible read — one index scan, no lookup stages — and is
        // appropriate because the caller wants the full catalogue of fields of
        // study regardless of admission availability.
        if (!admission_programs_available) {
            const results = await this.programTemplateModel.distinct('field_of_study');
            return results
                .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
                .sort();
        }

        // Forward aggregation: AdmissionPrograms → Programs → ProgramTemplates
        //
        // We deliberately start from the AdmissionPrograms collection rather
        // than from ProgramTemplates. The reason is semantic correctness and
        // performance:
        //
        // - Semantic: AdmissionPrograms is the authoritative source for "what
        //   is currently open for admission". Starting there means every
        //   document we process is guaranteed to have an admission program
        //   backing it; we never touch a template that isn't reachable from
        //   one. Contrast this with the reverse direction, which would scan
        //   every template in the catalogue and then try to prove reachability
        //   by looking up programs and admission programs — an existence proof
        //   rather than a natural traversal.
        //
        // - Performance: AdmissionPrograms is typically a much smaller
        //   collection than ProgramTemplates (one row per open intake, not one
        //   row per degree programme ever created). Starting from the smaller
        //   set and fanning out is generally faster than scanning the larger
        //   set and filtering down.
        //
        // NOTE FOR FUTURE DEVELOPERS: if the aggregation below ever becomes
        // hard to maintain and you are willing to accept a slight performance
        // regression, the reverse lookup is a valid alternative:
        //   ProgramTemplates → (lookup Programs by template field) →
        //   (lookup AdmissionPrograms by program field) → group by field_of_study
        // The result is identical; the cost is scanning all templates up front
        // instead of only those reachable from admissions.
        const pipeline: PipelineStage[] = [
            {
                $lookup: {
                    from: DB_COLLECTIONS.PROGRAMS,
                    localField: 'program',
                    foreignField: '_id',
                    as: 'programDetails',
                },
            },
            { $unwind: '$programDetails' },
            {
                $lookup: {
                    from: DB_COLLECTIONS.PROGRAM_TEMPLATES,
                    localField: 'programDetails.template',
                    foreignField: '_id',
                    as: 'templateDetails',
                },
            },
            {
                $unwind: {
                    path: '$templateDetails',
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $match: {
                    'templateDetails.field_of_study': { $exists: true, $ne: null, $nin: [''] },
                },
            },
            { $group: { _id: '$templateDetails.field_of_study' } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, field_of_study: '$_id' } },
        ];

        const result = await this.programTemplateModel.db
            .collection(DB_COLLECTIONS.ADMISSION_PROGRAMS)
            .aggregate(pipeline)
            .toArray();

        return result.map((item) => item.field_of_study);
    }

    async remove(id: string): Promise<{ deleted: boolean }> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid program template ID');
        }

        const result = await this.programTemplateModel.findByIdAndDelete(id).exec();

        if (!result) {
            throw new NotFoundException(`Program template with ID ${id} not found`);
        }

        return { deleted: true };
    }
}
