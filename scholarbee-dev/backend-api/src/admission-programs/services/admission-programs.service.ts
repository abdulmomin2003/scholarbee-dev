import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, PopulatedDoc, SortOrder, Types } from 'mongoose';
import { QueryAdmissionProgramDegreeLevelsDto } from 'src/admission-programs/dto/query-admission-program-degree-levels.dto';
import { QueryAdmissionProgramMajorsDto } from 'src/admission-programs/dto/query-admission-program-majors.dto';
import { SearchHistoryAnalyticsService } from 'src/analytics/services/search-history.analytics.service';
import {
  ISearchHistoryIndexDoc,
  SearchResourceEnum,
} from 'src/elasticsearch/mappings/search-history.mapping';
import { ElasticsearchService } from 'src/elasticsearch/elasticsearch.service';
import { UserNS } from 'src/users/schemas/user.schema';
import { CreateAdmissionProgramDto } from '../dto/create-admission-program.dto';
import { FilterAdmissionProgramDto } from '../dto/filter-admission-program.dto';
import { QueryAdmissionProgramDto } from '../dto/query-admission-program.dto';
import { UpdateAdmissionProgramDto } from '../dto/update-admission-program.dto';
import { AdmissionProgramsGateway } from '../gateways/admission-programs.gateway';
import {
  AdmissionProgram,
  AdmissionProgramDocument,
} from '../schemas/admission-program.schema';
import { AuthenticatedRequest, OptionalAuthenticatedRequest } from 'src/auth/types/auth.interface';
import { QueryAdmissionProgramByIdDto } from '../dto/query-admission-program.dto';
import { escapeRegex, stringToObjectId, WithObjectId } from 'src/utils/db.utils';
import { toSlug } from 'src/utils/slug.utils';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import { normalizeFeeStructure } from 'src/fee-structures/services/fee-structures.service';
import {
  Application,
  ApplicationDocument,
  ApplicationStatus,
} from 'src/applications/schemas/application.schema';
import {
  ExternalApplication,
  ExternalApplicationDocument,
} from 'src/external-applications/schemas/external-application.schema';
import {
  ElasticsearchAdmissionProgramDocumentWithIdAndFavorite,
  ElasticsearchAdmissionProgramResponse,
} from '../schemas/admission-program.types';
import { IConfiguration } from 'src/config/configuration';
import { ConfigService } from '@nestjs/config';
import { Program, ProgramDocument } from 'src/programs/schemas/program.schema';
import { UniversityDocument } from 'src/universities/schemas/university.schema';
import { Campus, CampusDocument } from 'src/campuses/schemas/campus.schema';
import { PopulateDto } from 'src/common/dto/populate.dto';
import { Admission, AdmissionDocument } from 'src/admissions/schemas/admission.schema';
import { AdmissionProgramDetailListQueryDto } from '../dto/admission-program-detail-list-query.dto';
import { getTemplateLookupStages, getTemplateLookupCleanupStage, mergeProgramTemplateFields } from 'src/utils/program-template-lookup.utils';
import { ProgramTemplateDocument } from 'src/program-templates/schemas/program-template.schema';

@Injectable()
export class AdmissionProgramsService {
  constructor(
    @InjectModel(AdmissionProgram.name)
    private admissionProgramModel: Model<AdmissionProgramDocument>,
    @InjectModel(Program.name)
    private programModel: Model<ProgramDocument>,
    @InjectModel(Admission.name)
    private admissionModel: Model<AdmissionDocument>,
    @InjectModel(Campus.name)
    private campusModel: Model<CampusDocument>,
    private readonly admissionProgramsGateway: AdmissionProgramsGateway,
    private readonly searchHistoryAnalyticsService: SearchHistoryAnalyticsService,
    private readonly elasticsearchService: ElasticsearchService,
    private configService: ConfigService<IConfiguration>,
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    @InjectModel(ExternalApplication.name)
    private externalApplicationModel: Model<ExternalApplicationDocument>,
  ) { }

  /**
   * Generate slug for an admission program
   * Format: {admissionTitle}-{programName}-{campusName}
   * Example: "fall-2026-computer-science-main-campus"
   * @param admissionTitle - Admission title
   * @param programName - Program name
   * @param campusName - Campus name (optional)
   * @returns Generated slug
   */
  private async generateSlug(admissionId: Types.ObjectId, programId: Types.ObjectId): Promise<string> {

    // Fetch related data to generate slug
    const [program, admission] = await Promise.all([
      this.programModel.findById(programId).populate('template').exec(),
      this.admissionModel.findById(admissionId).exec(),
    ]);

    if (!program || !admission) {
      throw new BadRequestException('Program or Admission not found');
    }

    if (!program.campus_id) throw new BadRequestException('Program does not have a campus');
    // Fetch campus if program has campus_id
    const campus = await this.campusModel.findById(program.campus_id).exec();
    const campusName = campus?.name;

    if (!campusName) throw new BadRequestException('Campus not found');

    const tmpl = program.template as unknown as ProgramTemplateDocument | null;
    const programName = tmpl?.name ?? program.name; /* TEMPLATE_FALLBACK */
    return toSlug(`${admission.admission_title}-${programName}-${campusName}`);
  }

  /**
   * Ensure slug is unique by appending counter if needed
   * If slug exists, appends -1, -2, -3, etc. until unique
   * @param slug - Base slug to check
   * @returns Unique slug
   */
  private async getUniqueSlug(slug: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;
    while (await this.admissionProgramModel.exists({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    return uniqueSlug;
  }

  async findAllDegreeLevels(
    queryAdmissionProgramDegreeLevelsDto: QueryAdmissionProgramDegreeLevelsDto,
  ): Promise<string[]> {
    const { university_id, campus_id } = queryAdmissionProgramDegreeLevelsDto;
    const pipeline: PipelineStage[] = [];

    // Stage 1: Optional: Filter by university_id and/or campus_id if provided
    if (university_id || campus_id) {
      // Lookup to admissions collection
      pipeline.push({
        $lookup: {
          from: DB_COLLECTIONS.ADMISSIONS,
          let: { admissionId: '$admission' }, // admission is now an ObjectId in AdmissionProgram
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$admissionId'] },
                    ...(university_id
                      ? [
                        {
                          $eq: [
                            '$university_id',
                            { $toObjectId: university_id },
                          ],
                        },
                      ]
                      : []),
                    ...(campus_id
                      ? [{ $eq: ['$campus_id', { $toObjectId: campus_id }] }]
                      : []),
                  ],
                },
              },
            },
          ],
          as: 'admissionDetails',
        },
      });
      // Filter out AdmissionPrograms that don't have matching admissionDetails (i.e., not for the given university/campus)
      pipeline.push({
        $match: {
          admissionDetails: { $ne: [] }, // or $size: { $gt: 0 }
        },
      });
    }

    // Stage 2: Lookup to programs collection
    pipeline.push({
      $lookup: {
        from: DB_COLLECTIONS.PROGRAMS,
        localField: 'program',
        foreignField: '_id',
        as: 'programDetails',
      },
    });

    // Stage 3: Unwind the programDetails array (should usually be one program per admission program)
    pipeline.push({
      $unwind: '$programDetails',
    });

    // Stage 3.5: Lookup template to get degree_level from template only (no fallback to program's deprecated field)
    pipeline.push({
      $lookup: {
        from: DB_COLLECTIONS.PROGRAM_TEMPLATES,
        localField: 'programDetails.template',
        foreignField: '_id',
        as: 'templateDetails',
      },
    });

    // Stage 3.6: Unwind template details
    pipeline.push({
      $unwind: {
        path: '$templateDetails',
        preserveNullAndEmptyArrays: false, // Exclude programs without templates
      },
    });

    // Stage 3.7: Filter templates with valid degree_level
    pipeline.push({
      $match: {
        $and: [
          { 'templateDetails.degree_level': { $ne: null } },
          { 'templateDetails.degree_level': { $ne: '' } },
          { 'templateDetails.degree_level': { $exists: true } },
        ],
      },
    });

    // Stage 4: Group by template's degree_level to get unique values
    pipeline.push({
      $group: {
        _id: '$templateDetails.degree_level',
      },
    });

    // Stage 5: Project to reshape the output
    pipeline.push({
      $project: {
        _id: 0,
        degree_level: '$_id',
      },
    });

    const result = await this.admissionProgramModel.aggregate(pipeline).exec();
    return result.map((item) => item.degree_level);
  }

  async findAllMajors(
    queryAdmissionProgramMajorsDto: QueryAdmissionProgramMajorsDto,
  ): Promise<string[]> {
    const { university_id, campus_id } = queryAdmissionProgramMajorsDto;
    const pipeline: PipelineStage[] = [];

    // Stage 1: Optional: Filter by university_id and/or campus_id if provided
    if (university_id || campus_id) {
      // Lookup to admissions collection
      pipeline.push({
        $lookup: {
          from: DB_COLLECTIONS.ADMISSIONS,
          let: { admissionId: '$admission' }, // admission is now an ObjectId in AdmissionProgram
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$admissionId'] },
                    ...(university_id
                      ? [
                        {
                          $eq: [
                            '$university_id',
                            new Types.ObjectId(university_id),
                          ],
                        },
                      ]
                      : []),
                    ...(campus_id
                      ? [{ $eq: ['$campus_id', new Types.ObjectId(campus_id)] }]
                      : []),
                  ],
                },
              },
            },
          ],
          as: 'admissionDetails',
        },
      });
      // Filter out AdmissionPrograms that don't have matching admissionDetails (i.e., not for the given university/campus)
      pipeline.push({
        $match: {
          admissionDetails: { $ne: [] }, // or $size: { $gt: 0 }
        },
      });
    }

    // Stage 2: Lookup to programs collection
    pipeline.push({
      $lookup: {
        from: DB_COLLECTIONS.PROGRAMS,
        localField: 'program',
        foreignField: '_id',
        as: 'programDetails',
      },
    });

    // Stage 3: Unwind the programDetails array (should usually be one program per admission program)
    pipeline.push({
      $unwind: '$programDetails',
    });

    // Stage 3.5: Lookup template to get field_of_study from template only (no fallback to program's deprecated major)
    pipeline.push({
      $lookup: {
        from: DB_COLLECTIONS.PROGRAM_TEMPLATES,
        localField: 'programDetails.template',
        foreignField: '_id',
        as: 'templateDetails',
      },
    });

    // Stage 3.6: Unwind template details
    pipeline.push({
      $unwind: {
        path: '$templateDetails',
        preserveNullAndEmptyArrays: false, // Exclude programs without templates
      },
    });

    // Stage 3.7: Filter templates with valid field_of_study
    pipeline.push({
      $match: {
        $and: [
          { 'templateDetails.field_of_study': { $ne: null } },
          { 'templateDetails.field_of_study': { $ne: '' } },
          { 'templateDetails.field_of_study': { $exists: true } },
        ],
      },
    });

    // Stage 4: Group by template's field_of_study to get unique values
    pipeline.push({
      $group: {
        _id: '$templateDetails.field_of_study',
      },
    });

    // Stage 5: Project to reshape the output
    pipeline.push({
      $project: {
        _id: 0,
        major: '$_id',
      },
    });

    const result = await this.admissionProgramModel.aggregate(pipeline).exec();
    return result.map((item) => item.major);
  }

  // REVIEW: Would it be better to put this in the `programService` directly or as a method of `searchHistoryAnalyticsService` itself?
  async indexAdmissionProgramSearchHistory(
    user_id: string,
    filterDto: FilterAdmissionProgramDto,
  ) {
    const {
      // degree_level, major, mode_of_study, name: program_name, university_id
      major,
      university,
      programName,
      campusId,
      degree_level,
      // courseForm,
      // fee,
      // year,
      // intake,
    } = filterDto;

    const admissionProgramSearchHistory: ISearchHistoryIndexDoc = {
      user_id,
      user_type: UserNS.UserType.Student,
      resource_type: SearchResourceEnum.ADMISSION_PROGRAM,
      data: {
        major,
        program_name: programName,
        university_id: university,
        campus_id: campusId,
        degree_level: degree_level,
        // mode_of_study: modeOfStudy,
        // program_id: programId,
        // university_name: universityName,
      },
    };

    // Track search event
    await this.searchHistoryAnalyticsService.indexSearchHistory(
      admissionProgramSearchHistory,
    );
  }

  /**
   * Create a new admission program with auto-generated slug if not provided
   * @param createAdmissionProgramDto - Admission program creation data
   * @param userId - ID of user creating the admission program
   * @returns Created admission program document
   */
  async create(
    createAdmissionProgramDto: CreateAdmissionProgramDto,
    userId: string,
  ): Promise<AdmissionProgramDocument> {
    try {
      // Generate slug if not provided
      const slug = await this.generateSlug(
        // admission id
        createAdmissionProgramDto.admission,
        // program id
        createAdmissionProgramDto.program,
      ).then((slug) => {
        // Ensure slug is unique
        return this.getUniqueSlug(slug);
      });

      const createdAdmissionProgram = new this.admissionProgramModel({
        ...createAdmissionProgramDto,
        slug,
        createdBy: stringToObjectId(userId),
        created_at: new Date(),
      });

      const savedProgram = await createdAdmissionProgram.save();
      this.admissionProgramsGateway.emitAdmissionProgramUpdate(savedProgram);
      return savedProgram;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async findAll(
    queryDto: QueryAdmissionProgramDto,
  ): Promise<{ data: AdmissionProgramDocument[]; meta: any }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      admission,
      program,
      favouriteBy,
      minAvailableSeats,
      maxAvailableSeats,
      populate = true,
    } = queryDto;

    const skip = (page - 1) * limit;
    const sortOptions: Record<string, SortOrder> = {
      [sortBy]: sortOrder as SortOrder,
    };

    // Build filter
    const filter: any = {};

    if (search) {
      // Search in relevant fields
      filter.$or = [
        { 'admission_requirements.key': { $regex: search, $options: 'i' } },
        { redirect_deeplink: { $regex: search, $options: 'i' } },
      ];
    }

    if (admission) {
      filter.admission = stringToObjectId(admission);
    }

    if (program) {
      filter.program = stringToObjectId(program);
    }

    if (favouriteBy && favouriteBy.length > 0) {
      // only return documents where the favouriteBy array contains both of those IDs (order doesn’t matter). ($all is used to match all elements in the array. $in is used to match any of the elements in the array.)
      filter.favouriteBy = { $all: favouriteBy };
    }

    if (minAvailableSeats !== undefined) {
      filter.available_seats = {
        ...filter.available_seats,
        $gte: minAvailableSeats,
      };
    }

    if (maxAvailableSeats !== undefined) {
      filter.available_seats = {
        ...filter.available_seats,
        $lte: maxAvailableSeats,
      };
    }

    // Execute query
    let query = this.admissionProgramModel.find(filter);

    // Apply population if requested
    if (populate) {
      query = query
        .populate('admission')
        .populate({
          path: 'program',
          populate: [
            { path: 'template' },
            {
              path: 'campus_id',
              populate: [{ path: 'address_id' }, { path: 'university_id' }],
            },
            {
              path: 'academic_departments',
            },
            {
              path: 'fee_structure',
            },
          ],
        })
        .populate('createdBy');
    }

    // Get total count for pagination
    const total = await this.admissionProgramModel.countDocuments(filter);

    // Apply sorting and pagination
    const data = await query
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Merge template fields and normalize fee structures
    const normalizedData = data.map((item: any) => {
      if (item.program) {
        mergeProgramTemplateFields(item.program as Record<string, unknown>);
      }
      if (item.program?.fee_structure) {
        item.program.fee_structure = normalizeFeeStructure(item.program.fee_structure);
      }
      return item;
    });

    return {
      data: normalizedData,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a single admission program by its MongoDB Unique ID.
   * * Validates the provided ID and triggers the core aggregation pipeline to fetch
   * comprehensive program details, including nested admissions, campus, university,
   * and user-specific application status.
   *
   * @param user - The authenticated user making the request
   * @param admission_program_id - The Hexadecimal MongoDB ObjectId string
   * @param queryDto - Query parameters for additional filtering or population flags
   * @returns Promise containing the populated AdmissionProgram document with computed user fields
   * @throws {BadRequestException} If the provided ID is not a valid MongoDB ObjectId
   * @throws {NotFoundException} If no admission program matches the given ID
   */
  async findById(
    user: OptionalAuthenticatedRequest['user'],
    admission_program_id: string,
  ) {
    if (!Types.ObjectId.isValid(admission_program_id)) {
      throw new BadRequestException(`Invalid ID: ${admission_program_id}`);
    }

    const matchStage: PipelineStage = {
      $match: { _id: new Types.ObjectId(admission_program_id) }
    };

    const results = await this.getAdmissionProgramDetails(user, matchStage);

    if (!results || results.length === 0) {
      throw new NotFoundException('Admission program not found');
    }

    return results[0];
  }

  /**
   * Find a single admission program by its SEO-friendly URL slug.
   * * This is the preferred method for public-facing routes. It utilizes the same 
   * enrichment pipeline as findById but matches the document using the unique slug field.
   *
   * @param user - The authenticated user making the request
   * @param slug - The unique string identifier used in the URL
   * @returns Promise containing the populated AdmissionProgram document with computed user fields
   * @throws {BadRequestException} If the slug parameter is missing or empty
   * @throws {NotFoundException} If no admission program matches the given slug
   */
  async findBySlug(
    user: OptionalAuthenticatedRequest['user'],
    slug: string,
  ) {
    if (!slug) {
      throw new BadRequestException('Slug is required');
    }

    const matchStage: PipelineStage = {
      $match: { slug: slug }
    };

    const results = await this.getAdmissionProgramDetails(user, matchStage);

    if (!results || results.length === 0) {
      throw new NotFoundException('Admission program not found');
    }

    return results[0];
  }

  /**
   * Get admission program details by filter parameters.
   *
   * Slug resolution priority:
   * - If `campus_slug` is provided it is used directly to filter by `admission.campus.slug`.
   * - If only the deprecated `university_slug` is provided it is resolved internally to the
   *   equivalent university-level filter (`admission.university.slug`) for backward compatibility.
   * - At least one of the two must be supplied; a `BadRequestException` is thrown otherwise.
   *
   * @param user - The authenticated user making the request
   * @param queryDto - Query parameters containing slug, major, degree_level, city, and session filters
   * @returns Array of admission programs matching the filters
   */
  async getDetailList(
    user: OptionalAuthenticatedRequest['user'],
    queryDto: AdmissionProgramDetailListQueryDto,
  ): Promise<any[]> {
    const { university_slug, campus_slug, major, degree_level, city, seo_title_key, session_term, session_year, only_latest_term_programs } = queryDto;

    if (!campus_slug && !university_slug) {
      throw new BadRequestException('Either campus_slug or university_slug is required');
    }

    const conditions: Record<string, unknown>[] = [];

    // Slug resolution: campus_slug takes priority over the deprecated university_slug
    if (campus_slug) {
      conditions.push({ 'admission.campus.slug': { $regex: new RegExp(`^${escapeRegex(campus_slug)}$`, 'i') } });
    } else {
      // Backward-compatible resolution via university slug
      conditions.push({ 'admission.university.slug': { $regex: new RegExp(`^${escapeRegex(university_slug)}$`, 'i') } });
    }

    conditions.push({ 'admission.campus.address.city': { $regex: new RegExp(`^${escapeRegex(city)}$`, 'i') } });

    if (seo_title_key) {
      conditions.push({ 'program.seo_title_key': { $regex: new RegExp(`^${escapeRegex(seo_title_key)}$`, 'i') } });
    }

    if (major) {
      conditions.push({ 'program.major': { $regex: new RegExp(`^${escapeRegex(major)}$`, 'i') } });
    }

    if (degree_level) {
      conditions.push({ 'program.degree_level': { $regex: new RegExp(`^${escapeRegex(degree_level)}$`, 'i') } });
    }

    if (session_term) {
      conditions.push({ 'admission.session_term': session_term });
    }

    // session_year is suppressed when only_latest_term_programs is active — the year is
    // resolved automatically via the DB-level aggregation stages below.
    if (session_year && !only_latest_term_programs) {
      conditions.push({ 'admission.session_year': session_year });
    }

    const postPopulateMatchStage: PipelineStage = {
      $match: {
        $and: conditions,
      },
    };

    // When only_latest_term_programs is requested, inject aggregation stages that reduce the
    // result set to only the records from the highest available session year — entirely at DB level.
    const additionalStages: PipelineStage[] = [
      { $sort: { 'admission.session_year': -1 } },
    ];

    if (only_latest_term_programs) {
      additionalStages.push(
        {
          $group: {
            _id: null,
            latestYear: { $first: '$admission.session_year' },
            allDocs: { $push: '$$ROOT' },
          },

        },
        {
          $project: {
            docs: {
              $filter: {
                input: '$allDocs',
                cond: { $eq: ['$$this.admission.session_year', '$latestYear'] },
              },
            },
          },
        },
        { $unwind: '$docs' },
        { $replaceRoot: { newRoot: '$docs' } },
      );
    }

    // We pass null for initial match because we must filter AFTER population
    const results = await this.getAdmissionProgramDetails(user, null, postPopulateMatchStage, additionalStages);

    return results;
  }

  /**
   * Core aggregation engine for Admission Program retrieval.
   * Centralizes the complex lookup logic to maintain DRY principles. This method:
   * 1. Executes the provided initial match stage (ID or Slug).
   * 2. Performs multi-level $lookup for Admissions -> Campus/University -> Addresses.
   * 3. Joins Program and Fee Structure data.
   * 4. Executes the optional post-populate match stage (for relational filtering).
   * 5. Computes real-time user data (was_redirected, is_already_applied).
   * 6. Normalizes financial data via normalizeFeeStructure.
   *
   * @param user - Authenticated user for application status checks
   * @param initialMatchStage - The specific $match criteria (ID or Slug) run before populates
   * @param postPopulateMatchStage - Optional $match criteria run after populates (for nested field queries)
   * @private
   */
  private async getAdmissionProgramDetails(
    user: OptionalAuthenticatedRequest['user'],
    initialMatchStage: PipelineStage | null,
    postPopulateMatchStage?: PipelineStage,
    additionalStages?: PipelineStage[],
  ) {
    const userObjectId = user?._id ? new Types.ObjectId(user._id) : null;

    const pipeline: PipelineStage[] = [];

    // Stage 1: Initial Match
    if (initialMatchStage) {
      pipeline.push(initialMatchStage);
    }

    pipeline.push(
      // Stage 2: Populate admission -> campus -> address & university -> address
      {
        $lookup: {
          from: DB_COLLECTIONS.ADMISSIONS,
          as: 'admission',
          let: { admissionId: '$admission' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$admissionId'] } } },
            // Campus Lookup
            {
              $lookup: {
                from: DB_COLLECTIONS.CAMPUSES,
                let: { campusId: '$campus_id' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$campusId'] } } },
                  {
                    $lookup: {
                      from: DB_COLLECTIONS.ADDRESSES,
                      localField: 'address_id',
                      foreignField: '_id',
                      as: 'address',
                    },
                  },
                  { $unwind: { path: '$address', preserveNullAndEmptyArrays: true } },
                ],
                as: 'campus',
              },
            },
            { $unwind: { path: '$campus', preserveNullAndEmptyArrays: true } },
            // University Lookup
            {
              $lookup: {
                from: DB_COLLECTIONS.UNIVERSITIES,
                let: { universityId: '$university_id' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$universityId'] } } },
                  {
                    $lookup: {
                      from: DB_COLLECTIONS.ADDRESSES,
                      localField: 'address_id',
                      foreignField: '_id',
                      as: 'address',
                    },
                  },
                  { $unwind: { path: '$address', preserveNullAndEmptyArrays: true } },
                ],
                as: 'university',
              },
            },
            { $unwind: { path: '$university', preserveNullAndEmptyArrays: true } },
          ],
        },
      },
      { $unwind: { path: '$admission', preserveNullAndEmptyArrays: true } },
      // Stage 4 & 5: Populate program
      {
        $lookup: {
          from: DB_COLLECTIONS.PROGRAMS,
          localField: 'program',
          foreignField: '_id',
          as: 'program',
        },
      },
      { $unwind: { path: '$program', preserveNullAndEmptyArrays: true } },
      // Stage 4.5: Lookup template and merge program fields (name, degree_level, field_of_study, major, tags)
      ...getTemplateLookupStages('program'),
      getTemplateLookupCleanupStage(),
      {
        $lookup: {
          from: DB_COLLECTIONS.FEE_STRUCTURES,
          localField: 'program.fee_structure',
          foreignField: '_id',
          as: 'fee_structure',
        },
      },
      { $unwind: { path: '$fee_structure', preserveNullAndEmptyArrays: true } }
    );

    // Stage 8: Post-Populate Match (New)
    if (postPopulateMatchStage) {
      pipeline.push(postPopulateMatchStage);
    }

    // Stage 8.5: Optional caller-supplied stages (e.g. latest-year resolution)
    if (additionalStages?.length) {
      pipeline.push(...additionalStages);
    }

    // Stage 9: Check for internal applications
    if (userObjectId) {
      pipeline.push({
        $lookup: {
          from: DB_COLLECTIONS.APPLICATIONS,
          let: { admissionProgramId: '$_id', userId: userObjectId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$applicant', '$$userId'] },
                    { $eq: ['$admission_program_id', '$$admissionProgramId'] },
                    { $ne: ['$status', ApplicationStatus.DRAFT] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: 'internal_applications',
        },
      });
    }

    pipeline.push(
      // Stage 10: Computed Fields
      {
        $addFields: {
          was_redirected: userObjectId
            ? {
              $cond: {
                if: { $not: { $ifNull: ['$redirected_students', false] } },
                then: false,
                else: { $in: [userObjectId, '$redirected_students'] },
              },
            }
            : false,
          is_already_applied: userObjectId
            ? { $gt: [{ $size: { $ifNull: ['$internal_applications', []] } }, 0] }
            : false,
          // Explicit top-level field sourced from the program template's seo_title_key.
          // Replaces the deprecated nested path `program.seo_title_key` for consuming clients.
          program_template_seo_title: { $ifNull: ['$program.seo_title_key', null] },
        },
      },
      // Final cleanup
      { $project: { internal_applications: 0 } }
    );

    const result = await this.admissionProgramModel.aggregate(pipeline).exec();

    // Since this can now return multiple documents (or none for getDetailList), 
    // we process the array and return it. The calling methods can pick the first element.
    const normalizedResult = result.map((item: any) => {
      if (item.fee_structure) {
        item.fee_structure = normalizeFeeStructure(item.fee_structure);
      }
      return item;
    });

    return normalizedResult;
  }


  async update(
    id: string,
    updateAdmissionProgramDto: UpdateAdmissionProgramDto,
  ): Promise<AdmissionProgramDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid admission program ID');
    }

    const updatedAdmissionProgram = await this.admissionProgramModel
      .findByIdAndUpdate(
        id,
        { ...updateAdmissionProgramDto, updatedAt: new Date() },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedAdmissionProgram) {
      throw new NotFoundException(`Admission program with ID ${id} not found`);
    }

    this.admissionProgramsGateway.emitAdmissionProgramUpdate(
      updatedAdmissionProgram,
    );
    return updatedAdmissionProgram;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid admission program ID');
    }

    const admissionProgram = await this.admissionProgramModel
      .findById(id)
      .exec();

    if (!admissionProgram) {
      throw new NotFoundException(`Admission program with ID ${id} not found`);
    }

    await this.admissionProgramModel.findByIdAndDelete(id).exec();

    this.admissionProgramsGateway.emitAdmissionProgramUpdate({
      _id: id,
      deleted: true,
      admission: admissionProgram.admission,
      program: admissionProgram.program,
    });

    return { deleted: true };
  }

  async addToFavorites(
    admissionProgramId: Types.ObjectId,
    userId: string,
  ): Promise<AdmissionProgramDocument> {
    const userIdObjectId = new Types.ObjectId(userId);

    const admissionProgram = await this.admissionProgramModel
      .findByIdAndUpdate(
        admissionProgramId,
        { $addToSet: { favouriteBy: userIdObjectId } }, // ensures no duplicates
        { new: true }, // return the updated doc
      )
      .lean();

    if (!admissionProgram) {
      throw new NotFoundException(
        `Admission program with ID ${admissionProgramId.toString()} not found`,
      );
    }

    return admissionProgram;
  }

  async removeFromFavorites(
    admissionProgramId: Types.ObjectId,
    userId: string,
  ): Promise<AdmissionProgramDocument> {
    const userIdObjectId = new Types.ObjectId(userId);

    const admissionProgram = await this.admissionProgramModel
      .findByIdAndUpdate(
        admissionProgramId,
        { $pull: { favouriteBy: userIdObjectId } },
        { new: true }, // return updated doc
      )
      .lean();

    if (!admissionProgram) {
      throw new NotFoundException(
        `Admission program with ID ${admissionProgramId.toString()} not found`,
      );
    }

    return admissionProgram;
  }

  async findFavorites(
    userId: string,
    queryDto: QueryAdmissionProgramDto,
  ): Promise<{ data: AdmissionProgramDocument[]; meta: any }> {
    // Add the user ID to the favorites filter
    const foundAdmissionPrograms = await this.findAll({
      ...queryDto,
      favouriteBy: [new Types.ObjectId(userId)],
    });

    return foundAdmissionPrograms;
  }

  /**
   * Builds common aggregation pipeline stages for admission programs
   * @returns Array of common pipeline stages
   */
  private buildCommonPipelineStages(): PipelineStage[] {
    const stages: PipelineStage[] = [];

    // Admission lookup with nested university/campus/address lookups
    stages.push({
      $lookup: {
        from: DB_COLLECTIONS.ADMISSIONS,
        let: { admissionId: '$admission' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$admissionId'],
              },
            },
          },
          // Add university lookup
          {
            $lookup: {
              from: DB_COLLECTIONS.UNIVERSITIES,
              let: { universityId: '$university_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$universityId'],
                    },
                  },
                },
              ],
              as: 'university',
            },
          },
          {
            $unwind: { path: '$university', preserveNullAndEmptyArrays: true },
          },
          // Add campus lookup with address
          {
            $lookup: {
              from: DB_COLLECTIONS.CAMPUSES,
              let: { campusId: '$campus_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$campusId'],
                    },
                  },
                },
                {
                  $lookup: {
                    from: DB_COLLECTIONS.ADDRESSES,
                    let: { addressId: '$address_id' },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $eq: ['$_id', '$$addressId'],
                          },
                        },
                      },
                    ],
                    as: 'address',
                  },
                },
                {
                  $unwind: {
                    path: '$address',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
              as: 'campus',
            },
          },
          {
            $unwind: { path: '$campus', preserveNullAndEmptyArrays: true },
          },
        ],
        as: 'admission',
      },
    });

    stages.push({ $unwind: '$admission' });

    // Program lookup with academic departments
    stages.push({
      $lookup: {
        from: DB_COLLECTIONS.PROGRAMS,
        localField: 'program',
        foreignField: '_id',
        as: 'program',
      },
    });

    // Academic departments lookup
    stages.push({
      $lookup: {
        from: DB_COLLECTIONS.ACADEMIC_DEPARTMENTS,
        localField: 'program.academic_departments',
        foreignField: '_id',
        as: 'academic_departments',
      },
    });

    stages.push({ $unwind: '$program' });

    // Lookup template and merge program fields (name, degree_level, field_of_study, major, tags)
    stages.push(...getTemplateLookupStages('program'));
    stages.push(getTemplateLookupCleanupStage());

    // Fee structure lookup
    stages.push({
      $lookup: {
        from: DB_COLLECTIONS.FEE_STRUCTURES,
        localField: 'program.fee_structure',
        foreignField: '_id',
        as: 'fee_structure',
      },
    });

    stages.push({
      $unwind: {
        path: '$fee_structure',
        preserveNullAndEmptyArrays: true,
      },
    });

    // Extract tuition_fee from fees array if exists, otherwise use legacy field
    // This supports both new unified format and legacy format
    stages.push({
      $addFields: {
        'fee_structure.computed_tuition_fee': {
          $ifNull: [
            {
              $let: {
                vars: {
                  tuitionFeeItem: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: { $ifNull: ['$fee_structure.fees', []] },
                          as: 'fee',
                          cond: { $eq: ['$$fee.type', 'tuition'] },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: {
                  $cond: [
                    { $ne: ['$$tuitionFeeItem', null] },
                    '$$tuitionFeeItem.amount',
                    '$fee_structure.tuition_fee',
                  ],
                },
              },
            },
            null,
          ],
        },
      },
    });

    // Backward compatibility
    stages.push({
      $addFields: {
        fee_structures: {
          $cond: {
            if: { $ne: ['$fee_structure', null] },
            then: ['$fee_structure'],
            else: [],
          },
        },
      },
    });

    // Sorting
    stages.push({ $sort: { 'program.sorting_weight': -1 } });

    return stages;
  }

  async findWithFilters(
    queryParams: FilterAdmissionProgramDto,
  ): Promise<{ docs: any[]; pagination: any }> {
    const {
      major,
      min_fee,
      max_fee,
      year,
      intake,
      programName,
      university,
      degree_level,
      courseForm,
      campusId,
      page = 1,
      limit = 10,
    } = queryParams;

    const skip = (page - 1) * limit;
    const pipeline: PipelineStage[] = [];

    // For multiple records with filtering
    // Add common pipeline stages (same for both single and multiple records)
    pipeline.push(...this.buildCommonPipelineStages());

    // Apply filters
    if (major)
      pipeline.push({
        $match: { 'program.name': { $regex: major, $options: 'i' } },
      });
    if (programName)
      pipeline.push({
        $match: {
          'program.name': {
            $regex: escapeRegex(programName),
            $options: 'i',
          },
        },
      });

    if (university)
      pipeline.push({
        $match: { 'admission.university_id': new Types.ObjectId(university) },
      });
    if (campusId)
      pipeline.push({
        $match: { 'program.campus_id': new Types.ObjectId(campusId) },
      });

    if (year) {
      pipeline.push({
        $match: {
          'admission.admission_startdate': {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year}-12-31`),
          },
        },
      });
    }

    if (intake)
      pipeline.push({
        $match: {
          'program.intake_periods.intake_period': {
            $regex: intake,
            $options: 'i',
          },
        },
      });

    // Use degree_level if it is present, otherwise use studyLevel
    if (degree_level) {
      pipeline.push({
        $match: {
          'program.degree_level': { $regex: degree_level, $options: 'i' },
        },
      });
    }

    if (courseForm)
      pipeline.push({
        $match: {
          'program.mode_of_study': { $regex: courseForm, $options: 'i' },
        },
      });

    // Update filter construction for minFee and maxFee
    // Use computed_tuition_fee which handles both new fees array and legacy format
    if (min_fee !== undefined || max_fee !== undefined) {
      const feeFilter: any = {};
      if (min_fee !== undefined) {
        feeFilter.$gte = min_fee;
      }
      if (max_fee !== undefined) {
        feeFilter.$lte = max_fee;
      }

      pipeline.push({
        $match: {
          $or: [
            // Check computed_tuition_fee (supports both formats)
            {
              'fee_structures.computed_tuition_fee': feeFilter,
            },
            // Fallback to legacy field for documents without computed field
            {
              $and: [
                { 'fee_structures.computed_tuition_fee': { $exists: false } },
                { 'fee_structures.tuition_fee': feeFilter },
              ],
            },
          ],
        },
      });
    }
    // If `minFee` and `maxFee` are not present, use the `fee` query parameter if present

    // Pagination
    pipeline.push({
      $facet: {
        docs: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    });

    const result = await this.admissionProgramModel.aggregate(pipeline);

    const docs = result[0]?.docs || [];
    const totalCount = result[0]?.totalCount?.[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Normalize fee_structure in each document
    const normalizedDocs = docs.map((doc: any) => {
      if (doc.fee_structure) {
        doc.fee_structure = normalizeFeeStructure(doc.fee_structure as any);
      }
      // Also normalize fee_structures array if it exists
      if (Array.isArray(doc.fee_structures) && doc.fee_structures.length > 0) {
        doc.fee_structures = doc.fee_structures.map((fs: any) =>
          normalizeFeeStructure(fs)
        );
      }
      return doc;
    });

    const pagination = {
      totalDocs: totalCount,
      limit: limit,
      totalPages,
      page: page,
      pagingCounter: skip + 1,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      currentPageDocs: normalizedDocs.length, // Number of documents in current page
    };

    return { docs: normalizedDocs, pagination };
  }

  /**
   * Find admission programs with filters using Elasticsearch (v2)
   *
   * This method replaces the MongoDB-based findWithFilters with an Elasticsearch-based implementation.
   * It provides the same interface and functionality but with better search performance and capabilities.
   *
   * @param queryParams - Filter parameters for admission programs
   * @param userId - Optional user ID to check favorite status
   * @returns Promise<{ docs: any[]; pagination: any }> - Filtered admission programs with pagination
   */
  async findWithFiltersV2(
    queryParams: FilterAdmissionProgramDto,
    userId?: string,
  ): Promise<{ docs: any[]; pagination: any }> {
    const { page = 1, limit = 10 } = queryParams;
    const skip = (page - 1) * limit;

    const admissionProgramsIndexName = this.configService.get(
      'elasticsearch.admissionProgramsIndex',
      { infer: true },
    );

    // Build Elasticsearch query
    const query = this.buildElasticsearchQuery(queryParams, skip, limit);

    // Execute search
    const searchResult = (await this.elasticsearchService.search(
      admissionProgramsIndexName,
      query,
    )) as ElasticsearchAdmissionProgramResponse;

    // Extract results and build response
    const { docs, pagination } = this.buildResponse(
      searchResult,
      limit,
      page,
      skip,
    );

    // Update favorite status if user is authenticated
    if (userId && docs.length > 0) {
      await this.updateFavoriteStatus(docs, userId);
    }

    return { docs, pagination };
  }

  /**
   * Checks if the admission program allows external applications based on the university's configuration
   * 
   * @param admission_program_id - The ID of the admission program
   * @returns true if the admission program allows external applications, false otherwise
   */
  async isExternalApplicationAllowedForAdmissionProgram(admission_program_id: Types.ObjectId): Promise<{
    isExternalApplicationAllowed: boolean;
    university_name: string;
    university_id: string;
    redirect_deeplink: string;
  }> {
    const results = await this.admissionProgramModel.aggregate<{
      isExternalApplicationAllowed: boolean;
      university_name: string;
      university_id: string;
      redirect_deeplink: string;
    }>([
      { $match: { _id: admission_program_id } },

      // Join sequence
      { $lookup: { from: 'programs', localField: 'program', foreignField: '_id', as: 'program' } },
      { $unwind: { path: '$program', preserveNullAndEmptyArrays: true } },

      { $lookup: { from: 'campuses', localField: 'program.campus_id', foreignField: '_id', as: 'campus' } },
      { $unwind: { path: '$campus', preserveNullAndEmptyArrays: true } },

      { $lookup: { from: 'universities', localField: 'campus.university_id', foreignField: '_id', as: 'university' } },
      { $unwind: { path: '$university', preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 0,
          isExternalApplicationAllowed: {
            $eq: ['$university.allow_external_application', true]
          },
          university_name: '$university.name',
          university_id: '$university._id',
          redirect_deeplink: {
            $cond: {
              if: { $eq: ['$university.allow_external_application', true] },
              then: { $ifNull: ['$redirect_deeplink', '$__redirect_deeplink'] },
              else: '$$REMOVE' // Excludes the key entirely if not allowed
            }
          },
        },
      },
    ]);

    // 1. If results length is 0, the program_id itself didn't exist in the DB.
    if (results.length === 0) {
      throw new NotFoundException('Admission program not found');
    }

    // 2. Program found, return true for exists and the actual boolean flag
    return {
      isExternalApplicationAllowed: results[0].isExternalApplicationAllowed,
      university_name: results[0].university_name,
      university_id: results[0].university_id,
      redirect_deeplink: results[0].redirect_deeplink,
    };
  }
  /**
   * Checks if no filters are applied to the query
   * 
   * This method determines whether all filter fields are empty/undefined.
   * Pagination fields (page, limit) are not considered filters.
   * 
   * @param queryParams - Filter parameters for admission programs
   * @returns true if no filters are applied, false otherwise
   */
  private hasNoFilters(queryParams: FilterAdmissionProgramDto): boolean {
    // Fields that are not considered filters (pagination, etc.)

    const {
      page, limit,
      ...filterFields
    } = queryParams;


    const filterFieldEntries = Object.entries(filterFields);
    const isAnyFilterApplied = filterFieldEntries.some(([key, value]) => {
      return value !== undefined && value !== null;
    });

    return !isAnyFilterApplied;
  }

  /**
   * Builds Elasticsearch query with campus level prioritization
   *
   * This method constructs a complex Elasticsearch query that combines:
   * 1. Text search with fuzzy matching for program titles and majors
   * 2. Exact filters for categorical fields (university, campus, degree level, etc.)
   * 3. Range filters for numerical fields (tuition fees, dates)
   * 4. Campus level prioritization using function scoring
   *
   * ## Campus Level Prioritization Logic
   *
   * The query uses a `function_score` query to boost documents with lower campus levels.
   * Campus levels represent quality tiers where lower numbers indicate higher quality:
   * - Level 1: Highest quality campuses (gets highest boost)
   * - Level 2: High quality campuses
   * - Level 3: Medium quality campuses
   * - Level 4: Lower quality campuses
   * - Level 5: Default/unknown quality (gets lowest boost)
   *
   * ## Scoring Configuration
   *
   * The function score uses these parameters:
   * - `factor: 0.1`: Small multiplier to prevent overwhelming relevance scores
   * - `modifier: 'reciprocal'`: Inverts the value (1/level) so lower levels get higher scores
   * - `weight: 0.2`: Campus level contributes 20% to final score
   * - `missing: 5`: Documents without campus_level default to level 5
   *
   * ## Score Calculation Example
   *
   * For a document with campus_level = 2:
   * - Function score = 1/2 = 0.5
   * - Weighted contribution = 0.5 * 0.2 = 0.1
   * - Final score = (base relevance score) * (1 + 0.1) = 1.1x boost
   *
   * This ensures campus level provides a meaningful but not overwhelming influence
   * on search rankings while preserving the importance of text relevance and filters.
   *
   * @param queryParams - Search filters and parameters
   * @param skip - Number of documents to skip (pagination)
   * @param limit - Maximum number of documents to return
   * @returns Elasticsearch query object with function scoring
   */
  private buildElasticsearchQuery(
    queryParams: FilterAdmissionProgramDto,
    skip: number,
    limit: number,
  ) {
    const {
      major,
      min_fee,
      max_fee,
      year,
      intake,
      session_term,
      programName,
      university,
      degree_level,
      courseForm,
      campusId,
      city,
      state,
      country,
      area,
      receiving_applications,
      admission_startdate_from,
      admission_startdate_to,
      admission_enddate_from,
      admission_enddate_to,
      status,
    } = queryParams;

    const query: any = {
      query: {
        function_score: {
          // Base query containing all search filters and text matching
          query: {
            bool: {
              must: [], // Text search queries (program_title, major)
              filter: [], // Exact match filters (university, campus, etc.)
            },
          },
          // Function to boost documents based on campus level
          // field_value_factor is a reserved Elasticsearch feature (not custom) that boosts
          // documents based on numeric field values. With 'reciprocal' modifier, the formula is:
          // function_score = factor / field_value
          //
          // Example calculations:
          // - campus_level = 1: function_score = 0.1 / 1 = 0.1
          // - campus_level = 2: function_score = 0.1 / 2 = 0.05
          // - campus_level = 3: function_score = 0.1 / 3 = 0.033
          // - campus_level = 5: function_score = 0.1 / 5 = 0.02
          // - campus_level = missing: function_score = 0.1 / 7 = 0.014 (uses missing value)
          //
          // Lower campus_level values receive higher boosts, prioritizing programs at
          // lower campus levels (e.g., undergraduate over graduate programs).
          // The final boost is multiplied by weight (0.2) and added to the base query score.
          functions: [
            {
              field_value_factor: {
                field: 'campus_level', // Field to use for scoring
                factor: 0.1, // Base multiplier (keeps boost small)
                modifier: 'reciprocal', // 1/level (lower levels = higher scores)
                missing: 7, // Default value if field is missing
              },
              weight: 1.2, // Boost factor > 1.0 for multiplication (was 0.2 for addition)
            },
            // Function to penalize documents with expired admission_enddate
            // Documents with valid but expired deadlines get a very small weight (0.001)
            // When combined with score_mode: 'multiply' and boost_mode: 'multiply',
            // this significantly reduces their final score, pushing them to the end
            {
              filter: {
                bool: {
                  must: [
                    {
                      exists: {
                        field: 'admission_enddate', // Must have admission_enddate field
                      },
                    },
                    {
                      range: {
                        admission_enddate: {
                          lt: new Date().toISOString(), // Less than current date (expired)
                        },
                      },
                    },
                  ],
                },
              },
              weight: 0.01, // Very small weight - multiplies entire score, heavily penalizing expired
            },
            // Function to penalize admission programs that are not receiving applications
            //
            // This function penalizes programs where receiving_application = false.
            // Note: The inheritance logic (when receiving_application is set to "inherit"
            // in the database) is already resolved at indexing time in Elasticsearch.
            // By the time documents reach this query, the receiving_application field
            // is already normalized to either true or false - never "inherit".
            //
            // This ensures programs not accepting new applications appear lower in search
            // results but are still visible (30% score reduction via weight 0.7).
            {
              filter: {
                term: {
                  receiving_applications: 'false', // Match only programs NOT receiving applications
                },
              },
              weight: 0.7, // Penalty weight: reduces final score to 70% (30% reduction)
            },
          ],
          score_mode: 'multiply', // Multiply function scores together
          boost_mode: 'multiply', // Multiply base score by function score - expired penalty now multiplies entire score
        },
      },
      from: skip,
      size: limit,
      sort: [
        { _score: { order: 'desc' } },
        { 'program_title.keyword': { order: 'asc' } },
      ],
    };

    // ============================================================================
    // TEXT SEARCH QUERIES (added to 'must' clause for relevance scoring)
    // ============================================================================

    // Major search: Always uses match_phrase for exact phrase matching
    // This ensures the major query parameter matches the whole phrase exactly,
    // preventing tokenization issues where "Chemical Engineering" would match documents with just "Engineering"
    // Works for both single-word and multi-word majors
    if (major) {
      // Normalize input: trim whitespace and convert to lowercase for consistency
      const normalizedMajor = major.trim().toLowerCase();

      // Use match_phrase for all major queries to ensure exact phrase matching
      // slop: 0 means words must appear in exact order with no gaps
      query.query.function_score.query.bool.must.push({
        match_phrase: {
          major: {
            query: normalizedMajor,
            slop: 0, // Exact phrase match - words must be in order with no gaps
            boost: 1.0,
          },
        },
      });
    }

    // Program name search: Direct search on program title and tags with fuzzy matching,
    // giving a 2x boost to program_title to prioritize it over tags.
    if (programName) {
      query.query.function_score.query.bool.must.push({
        bool: {
          should: [
            // 1. Must contain all words (prevents "Computer Science" from showing up for "Data Science")
            {
              multi_match: {
                query: programName,
                fields: ['program_title^3.0', 'tags^1.0'],
                fuzziness: 'AUTO',
              },
            },
            // 2. Extra boost if they match the exact phrase perfectly
            {
              multi_match: {
                query: programName,
                fields: ['program_title^5.0'],
                type: 'phrase',
              },
            }
          ],
          minimum_should_match: 1
        }
      });
    }

    // Area generic search across location_details fields with fuzziness
    if (area) {
      query.query.function_score.query.bool.must.push({
        bool: {
          should: [
            { match: { 'location_details.city': { query: area, fuzziness: 'AUTO' } } },
            { match: { 'location_details.state': { query: area, fuzziness: 'AUTO' } } },
            { match: { 'location_details.country': { query: area, fuzziness: 'AUTO' } } },
            { match: { 'location_details.complete_address': { query: area, fuzziness: 'AUTO' } } },
          ],
          minimum_should_match: 1,
        },
      });
    }

    // ============================================================================
    // EXACT MATCH FILTERS (added to 'filter' clause - no relevance scoring)
    // ============================================================================

    // These filters use exact matching and don't contribute to relevance scores
    // They act as hard filters that must be satisfied for documents to be returned

    if (university) {
      query.query.function_score.query.bool.filter.push({
        term: { university_id: university },
      });
    }

    if (campusId) {
      query.query.function_score.query.bool.filter.push({
        term: { campus_id: campusId },
      });
    }

    if (intake) {
      query.query.function_score.query.bool.filter.push({
        term: { 'intake_period.keyword': intake }, // Uses keyword field for exact match
      });
    }

    if (session_term) {
      query.query.function_score.query.bool.filter.push({
        term: { 'session_term.keyword': session_term },
      });
    }

    if (degree_level) {
      query.query.function_score.query.bool.filter.push({
        term: { 'degree_level.keyword': degree_level },
      });
    }

    if (courseForm) {
      query.query.function_score.query.bool.filter.push({
        term: { 'study_mode.keyword': courseForm },
      });
    }

    // ============================================================================
    // AREA FILTERS (city/state/country) against location_details.* keyword fields
    // ============================================================================
    // IMPORTANT: These specific filters (city/state/country) override/narrow the
    // generic 'area' search when both are provided. The 'area' parameter searches
    // across location_details fields with fuzzy matching (in 'must' clause), while
    // these filters use exact matching (in 'filter' clause). When both are present:
    // - The area search matches documents containing the area term (fuzzy match)
    // - These filters further narrow results to exact matches for city/state/country
    // - The specific filters take precedence as they are more restrictive (exact vs fuzzy)
    // Example: area="New York" + city="Boston" will only return programs in Boston
    // (the city filter overrides the area search for city field)
    const cityTrimmed = typeof city === 'string' ? city.trim() : city;
    const stateTrimmed = typeof state === 'string' ? state.trim() : state;
    const countryTrimmed = typeof country === 'string' ? country.trim() : country;

    if (cityTrimmed) {
      query.query.function_score.query.bool.filter.push({
        match_phrase: { 'location_details.city': { query: cityTrimmed, slop: 0 } },
      });
    }

    if (stateTrimmed) {
      query.query.function_score.query.bool.filter.push({
        match_phrase: { 'location_details.state': { query: stateTrimmed, slop: 0 } },
      });
    }

    if (countryTrimmed) {
      query.query.function_score.query.bool.filter.push({
        match_phrase: { 'location_details.country': { query: countryTrimmed, slop: 0 } },
      });
    }

    // ============================================================================
    // RANGE FILTERS (added to 'filter' clause - no relevance scoring)
    // ============================================================================

    // Tuition fee range filter: Supports min_fee, max_fee, or both
    // NOTE: This queries the indexed 'tuition_fee' field in Elasticsearch.
    // The indexing process should extract tuition_fee from the fees array (new format)
    // or use the legacy tuition_fee field. This query will work once indexing is updated.
    if (min_fee !== undefined || max_fee !== undefined) {
      const rangeFilter: {
        range: {
          tuition_fee: {
            gte?: number; // Greater than or equal (minimum fee)
            lte?: number; // Less than or equal (maximum fee)
          };
        };
      } = {
        range: { tuition_fee: {} },
      };

      if (min_fee !== undefined) {
        rangeFilter.range.tuition_fee.gte = min_fee;
      }
      if (max_fee !== undefined) {
        rangeFilter.range.tuition_fee.lte = max_fee;
      }

      query.query.function_score.query.bool.filter.push(rangeFilter);
    }

    // Year filter: Filters by admission start date OR end date within the specified year
    // Shows documents if EITHER admission_startdate OR admission_enddate falls within the year
    // This allows programs to be found if they start or end in the specified year
    if (year) {
      const yearStart = new Date(`${year}-01-01`);
      const yearEnd = new Date(`${year}-12-31`);

      query.query.function_score.query.bool.filter.push({
        bool: {
          should: [
            {
              // Check if admission_startdate falls within the year
              range: {
                admission_startdate: {
                  gte: yearStart.toISOString(), // From January 1st
                  lte: yearEnd.toISOString(), // To December 31st
                },
              },
            },
            {
              // Check if admission_enddate falls within the year
              range: {
                admission_enddate: {
                  gte: yearStart.toISOString(), // From January 1st
                  lte: yearEnd.toISOString(), // To December 31st
                },
              },
            },
          ],
          minimum_should_match: 1, // At least one date must fall within the year
        },
      });
    }

    // ============================================================================
    // PRIMITIVE FILTERS - Frontend-driven pseudo-state construction
    // ============================================================================
    // These filters allow the frontend to construct their own pseudo-states
    // (Open, Closing Soon, Opening Soon, Closed, etc.) by combining these
    // primitive parameters. Frontend is responsible for determining which
    // combination of filters resolves to the UI state they want to display.

    // Receiving applications filter (three-state: "true"/"false"/undefined=all)
    // The field is stored as a string in Elasticsearch ("true"/"false").
    // The DTO keeps this as a string too, bypassing enableImplicitConversion which
    // would silently coerce Boolean("false") = true if the type were boolean.
    if (receiving_applications !== undefined) {
      query.query.function_score.query.bool.filter.push({
        term: {
          receiving_applications,
        },
      });
    }

    // Admission start date range filter
    // Supports filtering programs by admission start date (from/to boundaries)
    // Example: admission_startdate_from="2026-01-01" returns programs starting on or after Jan 1
    if (admission_startdate_from || admission_startdate_to) {
      const startDateFilter: {
        range: {
          admission_startdate: {
            gte?: string;
            lte?: string;
          };
        };
      } = {
        range: { admission_startdate: {} },
      };

      if (admission_startdate_from) {
        startDateFilter.range.admission_startdate.gte = admission_startdate_from;
      }
      if (admission_startdate_to) {
        startDateFilter.range.admission_startdate.lte = admission_startdate_to;
      }

      query.query.function_score.query.bool.filter.push(startDateFilter);
    }

    // Admission end date (deadline) range filter
    // Supports filtering programs by admission deadline (from/to boundaries)
    // Example: admission_enddate_to="2026-05-01" returns programs with deadlines before May 1
    // This is commonly used to find "closed" programs (deadline < now) or "closing soon" programs
    if (admission_enddate_from || admission_enddate_to) {
      const endDateFilter: {
        range: {
          admission_enddate: {
            gte?: string;
            lte?: string;
          };
        };
      } = {
        range: { admission_enddate: {} },
      };

      if (admission_enddate_from) {
        endDateFilter.range.admission_enddate.gte = admission_enddate_from;
      }
      if (admission_enddate_to) {
        endDateFilter.range.admission_enddate.lte = admission_enddate_to;
      }

      query.query.function_score.query.bool.filter.push(endDateFilter);
    }

    // ============================================================================
    // ADMISSION STATUS FILTER (Open/Closed/ClosingSoon/OpeningSoon)
    // ============================================================================
    // @deprecated Use receiving_applications + admission_startdate/admission_enddate
    // filters instead. Frontend should construct pseudo-states from primitive parameters.
    //
    // This filter remains for backward compatibility but is superseded by the
    // primitive filters above. New frontend implementations should use the primitive
    // filters to maintain separation of concerns (frontend decides states, backend filters).
    //
    // Filters admission programs based on admission deadline and start date status.
    //
    // Open: Programs with active or upcoming admission deadlines
    //   - admission_enddate >= current date (deadline is in the future)
    //   - OR admission_enddate is null/doesn't exist (no deadline set, considered open)
    //
    // Closed: Programs with expired admission deadlines
    //   - admission_enddate < current date (deadline has passed)
    //   - AND admission_enddate exists (must have a deadline to be considered closed)
    //
    // ClosingSoon: Programs with admission deadlines within 10 days
    //   - admission_enddate >= current date AND admission_enddate <= current date + 10 days
    //   - AND admission_enddate exists (must have a deadline)
    //
    // OpeningSoon: Programs with admission start dates within 15 days
    //   - admission_startdate >= current date AND admission_startdate <= current date + 15 days
    //   - AND admission_startdate exists (must have a start date)
    //
    // This filter works in conjunction with the existing expired deadline penalty function
    // (lines 1385-1409) which reduces scores for expired programs. When status='closed',
    // this filter ensures only expired programs are returned. When status='open', only
    // active/upcoming programs are returned.
    if (status) {
      const currentDate = new Date().toISOString();

      if (status === 'open') {
        // Open: admission_enddate >= current date OR admission_enddate doesn't exist
        query.query.function_score.query.bool.filter.push({
          bool: {
            should: [
              {
                // Deadline is in the future or today
                range: {
                  admission_enddate: {
                    gte: currentDate,
                  },
                },
              },
              {
                // No deadline set (null or doesn't exist) - considered open
                bool: {
                  must_not: {
                    exists: {
                      field: 'admission_enddate',
                    },
                  },
                },
              },
            ],
            minimum_should_match: 1,
          },
        });
      } else if (status === 'closed') {
        // Closed: admission_enddate < current date AND admission_enddate exists
        query.query.function_score.query.bool.filter.push({
          bool: {
            must: [
              {
                // Must have admission_enddate field
                exists: {
                  field: 'admission_enddate',
                },
              },
              {
                // Deadline has passed
                range: {
                  admission_enddate: {
                    lt: currentDate,
                  },
                },
              },
            ],
          },
        });
      } else if (status === 'closingSoon') {
        // ClosingSoon: admission_enddate within configured days (between now and N days from now)
        const closingSoonDays =
          this.configService.get('application.admissionPrograms.closingSoonDaysThreshold', {
            infer: true,
          }) ?? 10;
        const closingSoonDate = new Date();
        closingSoonDate.setDate(closingSoonDate.getDate() + closingSoonDays);
        const closingSoonDateISO = closingSoonDate.toISOString();

        query.query.function_score.query.bool.filter.push({
          bool: {
            must: [
              {
                // Must have admission_enddate field
                exists: {
                  field: 'admission_enddate',
                },
              },
              {
                // Deadline is in the future (not expired)
                range: {
                  admission_enddate: {
                    gte: currentDate,
                  },
                },
              },
              {
                // Deadline is within the configured "closing soon" window
                range: {
                  admission_enddate: {
                    lte: closingSoonDateISO,
                  },
                },
              },
            ],
          },
        });
      } else if (status === 'openingSoon') {
        // OpeningSoon: admission_startdate within configured days (between now and N days from now)
        const openingSoonDays =
          this.configService.get('application.admissionPrograms.openingSoonDaysThreshold', {
            infer: true,
          }) ?? 15;
        const openingSoonDate = new Date();
        openingSoonDate.setDate(openingSoonDate.getDate() + openingSoonDays);
        const openingSoonDateISO = openingSoonDate.toISOString();

        query.query.function_score.query.bool.filter.push({
          bool: {
            must: [
              {
                // Must have admission_startdate field
                exists: {
                  field: 'admission_startdate',
                },
              },
              {
                // Start date is in the future (not started yet)
                range: {
                  admission_startdate: {
                    gte: currentDate,
                  },
                },
              },
              {
                // Start date is within 15 days
                range: {
                  admission_startdate: {
                    lte: openingSoonDateISO,
                  },
                },
              },
            ],
          },
        });
      }
    }

    // ============================================================================
    // ENSURE BASE SCORE FOR CAMPUS_LEVEL PRIORITIZATION
    // ============================================================================
    // When only filters are applied (no text search), the must array is empty,
    // which results in a base score of 0 or 1. With boost_mode: 'multiply',
    // we need a base score > 0 for multiplication to work. Adding match_all
    // ensures all documents get a base score of 1.0, allowing the function_score
    // to properly boost based on campus_level (weights > 1.0) or penalize expired
    // deadlines (weight 0.001).
    const hasTextSearch = query.query.function_score.query.bool.must.length > 0;

    if (!hasTextSearch) {
      query.query.function_score.query.bool.must.push({
        match_all: {},
      });
    }

    // ============================================================================
    // ADJUST CAMPUS_LEVEL FUNCTION_SCORE WEIGHT FOR TEXT SEARCHES
    // ============================================================================
    // With boost_mode: 'multiply', weights > 1.0 boost scores and weights < 1.0 reduce them.
    // When text searches are present, we adjust the weight to maintain campus_level
    // influence. With multiplication, smaller adjustments have bigger relative impact.
    // 
    // For major filter specifically, we need higher weight because text relevance
    // scores can vary significantly between documents.
    if (hasTextSearch) {
      // Check if major filter is present - it needs higher weight
      const hasMajorFilter = major !== undefined && major !== null && major !== '';

      if (hasMajorFilter) {
        // For major filter, use higher weight (1.5) to ensure campus_level
        // prioritization remains effective with text relevance variations
        query.query.function_score.functions[0].weight = 1.5;
      } else {
        // For other text searches, use moderate weight (1.3)
        query.query.function_score.functions[0].weight = 1.3;
      }
    }

    // ============================================================================
    // CAMPUS GROUPING (COLLAPSE) WHEN NO FILTERS ARE APPLIED
    // ============================================================================
    // When no filters are applied, group programs by campus_id to return only
    // one program per campus. This prevents results from being overwhelmed by
    // multiple programs from the same campus.
    // 
    // Elasticsearch collapse feature groups documents by the specified field
    // and returns only the top-scoring document per group. The inner_hits can
    // be used to retrieve additional documents from each group if needed.
    // 
    // Note: Collapse requires a keyword field, not a text field. Using
    // campus_id.keyword to access the keyword sub-field if available, otherwise
    // fallback to campus_id if it's already mapped as a keyword field.
    const shouldCollapse = this.hasNoFilters(queryParams);

    if (shouldCollapse) {
      query.collapse = {
        field: 'campus_id.keyword', // Use keyword field for collapse
        inner_hits: {
          name: 'programs',
          size: 1,
          sort: [{ _score: { order: 'desc' } }],
        },
      };
    }

    return query;
  }

  /**
   * CONFIGURATION NOTES FOR FUTURE ENGINEERS:
   *
   * ## Campus Level Boost Tuning
   *
   * To adjust campus level influence on search results, modify these parameters:
   *
   * 1. **factor**: Controls the base multiplier (currently 0.1)
   *    - Increase to 0.2 for stronger campus level influence
   *    - Decrease to 0.05 for weaker influence
   *
   * 2. **weight**: Controls the percentage contribution (currently 0.2 = 20%)
   *    - Increase to 0.3 for 30% influence
   *    - Decrease to 0.1 for 10% influence
   *
   * 3. **modifier**: Controls how campus level values are transformed
   *    - 'reciprocal': 1/level (lower levels = higher scores) - CURRENT
   *    - 'log1p': log(1 + level) (smoother curve)
   *    - 'log2p': log(2 + level) (even smoother)
   *
   * ## Testing Campus Level Impact
   *
   * To test the impact of campus level changes:
   * 1. Run searches with identical parameters
   * 2. Compare rankings before/after changes
   * 3. Verify that highly relevant results still rank well
   * 4. Check that campus level differences are meaningful but not overwhelming
   *
   * ## Query Structure Overview
   *
   * The final query structure is:
   * ```
   * function_score {
   *   query: bool {
   *     must: [text search queries]     // Contribute to relevance
   *     filter: [exact/range filters]   // Hard filters, no scoring
   *   }
   *   functions: [campus_level_boost]   // Quality boost
   * }
   * ```
   *
   * This ensures that:
   * - Text relevance drives primary ranking
   * - Filters narrow down results
   * - Campus level provides quality-based boost
   */

  /**
   * Builds response from Elasticsearch search results
   * 
   * This method ensures a consistent response structure regardless of whether
   * collapse (grouping) is used or not:
   * 
   * - When collapse is used (no filters): Returns one document per campus
   *   from the main hits array. The inner_hits are ignored to maintain
   *   consistent response structure.
   * 
   * - When collapse is not used (filters applied): Returns all matching
   *   documents from the main hits array.
   * 
   * Both cases return the same structure: { docs: [...], pagination: {...} }
   * 
   * @param searchResult - Elasticsearch search response
   * @param limit - Number of results per page
   * @param page - Current page number
   * @param skip - Number of documents to skip
   * @returns Formatted response with documents and pagination (consistent structure)
   */
  private buildResponse(
    searchResult: ElasticsearchAdmissionProgramResponse,
    limit: number,
    page: number,
    skip: number,
  ) {
    const hits = searchResult.hits?.hits || [];
    const totalHits = searchResult.hits?.total;
    const totalCount =
      typeof totalHits === 'object' ? totalHits.value : totalHits || 0;

    // Transform Elasticsearch hits to expected format
    // The response structure is consistent whether collapse is used or not:
    // - With collapse: main hits contain one document per campus (grouped)
    // - Without collapse: main hits contain all matching documents
    // Both cases extract from hit._source in the same way
    const docs = hits.map((hit) => {
      const source = hit._source;

      const sourceDocWithId: ElasticsearchAdmissionProgramDocumentWithIdAndFavorite =
      {
        ...source,
        _id: source.doc_id,
        isFavorite: false,
      };

      return sourceDocWithId;
    });

    // Build pagination
    const totalPages = Math.ceil(totalCount / limit);
    const pagination = {
      totalDocs: totalCount,
      limit: limit,
      totalPages,
      page: page,
      pagingCounter: skip + 1,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      currentPageDocs: docs.length, // Number of documents in current page
    };

    return { docs, pagination };
  }

  private async updateFavoriteStatus(
    docs: ElasticsearchAdmissionProgramDocumentWithIdAndFavorite[],
    userId: string,
  ) {
    const admissionProgramIds = docs.map((doc) => new Types.ObjectId(doc._id));
    const userIdObjectId = new Types.ObjectId(userId);

    // Fetch favorite status for all admission programs in one query
    const favoriteStatuses = await this.admissionProgramModel
      .find(
        {
          _id: { $in: admissionProgramIds },
          favouriteBy: { $in: [userIdObjectId] },
        },
        { _id: 1 },
      )
      .lean();

    // Create a set of favorited program IDs for O(1) lookup
    const favoriteAdmissionProgramIds = new Set(
      favoriteStatuses.map((program) => program._id.toString()),
    );

    // Update isFavorite status for each document
    docs.forEach((doc) => {
      doc.isFavorite = favoriteAdmissionProgramIds.has(doc._id);
    });
  }

  /**
   * Get admission programs by academic department
   * 
   * This method retrieves all programs belonging to a specific academic department,
   * then finds all admission programs for those programs, and filters them to only
   * include admission programs with valid (non-expired) admission deadlines.
   * 
   * The aggregation pipeline:
   * 1. Starts from programs collection and matches programs by academic_departments
   * 2. Looks up admission-programs for each program
   * 3. Looks up admissions to get admission_deadline
   * 4. Filters admission programs where deadline is null or >= current date
   * 5. Projects output with program name and individual admission program ID
   * 
   * Note: Each admission program is returned as a separate document with the program name repeated.
   * If a program has multiple admission programs, the program name will appear multiple times.
   * 
   * @param academicDepartmentId - The ObjectId of the academic department
   * @returns Array of objects, each containing program name and a single admission program ID
   */
  async getAdmissionProgramsByAcademicDepartment(
    academicDepartmentId: Types.ObjectId,
  ): Promise<
    Array<{
      program_name: string;
      admission_program_id: Types.ObjectId;
    }>
  > {
    const currentDate = new Date();

    // Aggregation pipeline starting from programs collection
    const pipeline: PipelineStage[] = [
      // Stage 1: Match programs by academic department and exclude deleted programs
      {
        $match: {
          academic_departments: academicDepartmentId,
          deleted: { $ne: true },
        },
      },
      // Stage 2: Lookup admission programs for each program
      {
        $lookup: {
          from: DB_COLLECTIONS.ADMISSION_PROGRAMS,
          localField: '_id',
          foreignField: 'program',
          as: 'admission_programs',
        },
      },
      // Unwind admission programs to work with individual admission program documents
      { $unwind: '$admission_programs' },
      // Stage 3: Lookup admission details to get admission_deadline
      {
        $lookup: {
          from: DB_COLLECTIONS.ADMISSIONS,
          localField: 'admission_programs.admission',
          foreignField: '_id',
          as: 'admission',
        },
      },
      // Unwind admission to get single admission document
      { $unwind: { path: '$admission', preserveNullAndEmptyArrays: true } },
      // Stage 4: Filter admission programs with valid deadlines
      // Valid deadline means: null/undefined OR >= current date
      {
        $match: {
          $or: [
            { 'admission.admission_deadline': null },
            { 'admission.admission_deadline': { $exists: false } },
            { 'admission.admission_deadline': { $gte: currentDate } },
          ],
        },
      },
      // Stage 1.5: Lookup template and merge fields (name, degree_level, field_of_study, major, tags)
      ...getTemplateLookupStages(),
      getTemplateLookupCleanupStage(),
      // Stage 5: Project output with program name and individual admission program ID
      // Each admission program becomes a separate document
      {
        $project: {
          _id: 0,
          program_name: '$name',
          admission_program_id: '$admission_programs._id',
        },
      },
    ];

    // Execute aggregation on programs collection
    const result = await this.programModel.aggregate(pipeline).exec();

    return result;
  }

  /**
   * Get total count of admission programs in the database
   * 
   * @returns Total count of admission programs
   */
  async getTotalCount(): Promise<{ total_admission_programs_count: number }> {
    const total = await this.admissionProgramModel.countDocuments().exec();
    return { total_admission_programs_count: total };
  }

}
