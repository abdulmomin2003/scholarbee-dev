import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, PopulatedDoc, RootFilterQuery, Types } from 'mongoose';
import { SearchHistoryAnalyticsService } from 'src/analytics/services/search-history.analytics.service';
import { AuthenticatedRequest } from 'src/auth/types/auth.interface';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import { DegreeLevelEnum } from 'src/common/constants/shared.constants';
import {
  ISearchHistoryIndexDoc,
  SearchResourceEnum,
} from 'src/elasticsearch/mappings/search-history.mapping';
import { UserNS } from 'src/users/schemas/user.schema';
import { escapeRegex, getSortOrder, stringToObjectId } from 'src/utils/db.utils';
import { toSlug } from 'src/utils/slug.utils';
import { BetterOmit } from 'src/utils/typescript.utils';
import { CompareProgramsDto } from '../dto/compare-programs.dto';
import { CreateProgramDto } from '../dto/create-program.dto';
import { QueryProgramDto } from '../dto/query-program.dto';
import { UpdateProgramDto } from '../dto/update-program.dto';
import { Program, ProgramDocument, ProgramDurationEnum } from '../schemas/program.schema';
import { Campus, CampusDocument } from 'src/campuses/schemas/campus.schema';
import { ProgramsByCampusResponseDto, ProgramByCampusDto } from 'src/programs/dto/programs-by-campus-response.dto';
import { AcademicDepartmentDocument } from 'src/academic-departments/schemas/academic-department.schema';
import { QueryCampusAdminProgramsDto, CampusAdminProgramStatusFilterEnum } from '../dto/query-campus-admin-programs.dto';
import { CampusAdminProgramsResponseDto, CampusAdminProgramDto } from '../dto/campus-admin-programs-response.dto';
import { AdmissionProgram, AdmissionProgramDocument } from 'src/admission-programs/schemas/admission-program.schema';
import { Admission, AdmissionDocument } from 'src/admissions/schemas/admission.schema';
import { normalizeFeeStructure } from 'src/fee-structures/services/fee-structures.service';
import { calculateAllSemesterFees } from 'src/fee-structures/utils/fee-calculations.util';
import { ProgramTemplate, ProgramTemplateDocument } from 'src/program-templates/schemas/program-template.schema';
import { getTemplateLookupStages, getTemplateLookupCleanupStage, mergeProgramTemplateFields } from 'src/utils/program-template-lookup.utils';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectModel(Program.name) private programModel: Model<ProgramDocument>,
    @InjectModel(AdmissionProgram.name) private admissionProgramModel: Model<AdmissionProgramDocument>,
    @InjectModel(Admission.name) private admissionModel: Model<AdmissionDocument>,
    @InjectModel(Campus.name) private campusModel: Model<CampusDocument>,
    @InjectModel(ProgramTemplate.name) private programTemplateModel: Model<ProgramTemplateDocument>,
    private readonly searchHistoryAnalyticsService: SearchHistoryAnalyticsService,
  ) { }

  /**
   * Generate slug for a program
   * Format: {campusName}-{programName} or just {programName} if no campus
   * Example: "nust-main-computer-science" or "computer-science"
   * @param programName - Program name
   * @param campusName - Campus name (optional)
   * @returns Generated slug
   */
  private async generateSlug(campusId: Types.ObjectId, programName: string): Promise<string> {
    const campus = await this.campusModel.findById(campusId).exec();
    const campusName = campus?.name;

    if (!campusName) {
      throw new NotFoundException(`Campus with ID ${campusId} not found`);
    }

    return toSlug(`${campusName}-${programName}`);
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
    while (await this.programModel.exists({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    return uniqueSlug;
  }

  // REVIEW: Would it be better to put this in the `programService` directly or as a method of `searchHistoryAnalyticsService` itself?
  async indexProgramSearchHistory(user_id: string, queryDto: QueryProgramDto) {
    const {
      search,
      name: program_name,
      major,
      mode_of_study,
      university_id,
      campus_id,
      degree_level,
    } = queryDto;

    const programSearchHistory: ISearchHistoryIndexDoc = {
      user_id,
      user_type: UserNS.UserType.Student,
      resource_type: SearchResourceEnum.PROGRAM,
      data: {
        search,
        major,
        program_name,
        university_id: university_id?.toString(),
        campus_id: campus_id?.toString(),
        degree_level: degree_level as DegreeLevelEnum,
        mode_of_study,
      },
    };

    return await this.searchHistoryAnalyticsService.indexSearchHistory(
      programSearchHistory,
    );
  }

  // method to translate the university_id filter to campus_id filter
  private async extractCampusIdsFromUniversityId(
    universityId: Types.ObjectId,
  ): Promise<Types.ObjectId[]> {

    // Get campus IDs for the university
    const campusesAggregation = await this.programModel
      .aggregate<{ _id: Types.ObjectId }>([
        {
          $lookup: {
            // lookup the `campuses` collection
            from: 'campuses',
            // means that the `campus_id` in the program documents is the id of the campus documents in the campuses collection. And we ensure that the campus_id is an object id and saved as `campusId` for the lookup
            let: { campusId: { $toObjectId: '$campus_id' } },
            // use the `campusId` to match the `_id` of the campus documents in the campuses collection AND ensure that the university_id of the campus documents matches the `universityId`
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$campusId'] }, // REVIEW: Do we need this filter? Bcz we only know the university_id and we want to get all campuses of the university So how can we get the campus_id?
                      { $eq: ['$university_id', universityId] },
                    ],
                  },
                },
              },
            ],
            as: 'campus',
          },
        },
        {
          $match: { campus: { $ne: [] } },
        },
        {
          $group: { _id: '$campus_id' },
        },
      ])
      .exec();

    const campusIds = campusesAggregation.map((item) => item._id);

    return campusIds;
  }

  private buildFilterQuery(
    queryDto: Partial<
      BetterOmit<
        QueryProgramDto,
        'skip' | 'page' | 'sortBy' | 'sortOrder' | 'limit'
      >
    >,
    includeDeleted: boolean = false,
  ): RootFilterQuery<ProgramDocument> {
    const {
      search,
      name,
      major,
      mode_of_study,
      university_id,
      campus_id,
      campus_ids,
      degree_level,
      duration,
      academic_departments,
    } = queryDto;
    const filter: RootFilterQuery<ProgramDocument> = {};

    // Exclude deleted programs by default unless explicitly included
    if (!includeDeleted) {
      filter.deleted = { $ne: true };
    }

    // Apply filters
    // TODO: Migrate search/filter on name, major, degree_level to aggregation-based
    // filtering when deprecated program fields are removed in favor of ProgramTemplate.
    // Currently these filters work because the deprecated fields still exist in DB. /* TEMPLATE_FALLBACK */
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { major: { $regex: search, $options: 'i' } },
      ];
    }

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (major) {
      filter.major = { $regex: major, $options: 'i' };
    }

    if (mode_of_study) {
      filter.mode_of_study = { $regex: mode_of_study, $options: 'i' };
    }

    if (degree_level) {
      filter.degree_level = { $regex: degree_level, $options: 'i' };
    }

    if (duration) {
      filter.duration = duration;
    }

    // Give preference to single campus_id filter over multiple campus_ids filter.
    // DTO now transforms to ObjectIds, so we can assign directly.
    if (campus_id) {
      filter.campus_id = campus_id as unknown as Types.ObjectId;
    } else if (campus_ids && campus_ids.length) {
      filter.campus_id = { $in: campus_ids as unknown as Types.ObjectId[] };
    }

    if (academic_departments) {
      filter.academic_departments = academic_departments as unknown as Types.ObjectId;
    }

    return filter;
  }

  /**
   * Create a new program with auto-generated slug if not provided
   * @param createProgramDto - Program creation data
   * @param user - Authenticated user
   * @returns Created program document
   */
  async create(
    createProgramDto: CreateProgramDto,
    user: AuthenticatedRequest['user'],
  ): Promise<ProgramDocument> {

    try {
      // Fetch template name for slug generation (name is now sourced from template)
      const template = await this.programTemplateModel.findById(createProgramDto.template).exec();
      if (!template) {
        throw new NotFoundException(`Program template with ID ${createProgramDto.template} not found`);
      }
      const slug = await this.generateSlug(user.campus_id, template.name).then((slug) => {
        return this.getUniqueSlug(slug);
      });

      const createdProgram = await this.programModel.create<BetterOmit<
        ProgramDocument,
        '_id' // they'll be auto-generated by the database
      >>({
        ...createProgramDto,
        slug,
        campus_id: user.campus_id,
      });

      return createdProgram;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async findAll(queryDto: QueryProgramDto): Promise<{
    programs: ProgramDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy,
      sortOrder,
      populate = true,
      university_id,
    } = queryDto;

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy ?? 'createdAt']: getSortOrder(sortOrder ?? 'desc') } as const;

    // If university_id is provided, extract the campus_ids from the university_id and add them to the queryDto
    if (university_id) {
      const campusIds = await this.extractCampusIdsFromUniversityId(university_id);
      queryDto.campus_ids = campusIds
    }

    const filter = this.buildFilterQuery(queryDto);
    console.log(`🚀 / filter:`, JSON.stringify(filter, null, 2))


    // Execute query
    const programs = await this.programModel
      .find(filter)
      .populate('template')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Merge template fields onto each program for the response
    programs.forEach((p) => mergeProgramTemplateFields(p as Record<string, unknown>));

    // Get total count
    const total = await this.programModel.countDocuments(filter).exec();
    const totalPages = Math.ceil(total / limit);

    if (populate) {
      // Populate fee structure for all programs
      await this.programModel.populate(programs, { path: 'fee_structure' });
    }

    return {
      programs: programs as unknown as ProgramDocument[],
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(
    id: Types.ObjectId,
    populate: boolean = true,
  ): Promise<ProgramDocument> {


    const program = await this.programModel.findById(id).populate('template').exec();

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    // Populate references if requested
    if (populate) {
      await program.populate('fee_structure');
    }

    // Merge template fields onto the program for the response
    const programObj = program.toObject();
    mergeProgramTemplateFields(programObj as unknown as Record<string, unknown>);

    return programObj as unknown as ProgramDocument;
  }

  /**
   * Find a program by its SEO-friendly slug
   * @param slug - The program slug
   * @param populate - Whether to populate related fields
   * @returns The program document or null if not found
   */
  async findBySlug(
    slug: string,
    populate: boolean = true,
  ): Promise<ProgramDocument | null> {
    const program = await this.programModel.findOne({ slug }).populate('template').exec();

    if (!program) {
      return null;
    }

    // Populate references if requested
    if (populate) {
      await program.populate('fee_structure');
    }

    // Merge template fields onto the program for the response
    const programObj = program.toObject();
    mergeProgramTemplateFields(programObj as unknown as Record<string, unknown>);

    return programObj as unknown as ProgramDocument;
  }

  /**
   * Checks if a program belongs to a specific campus
   * @param programId - The program ID to check
   * @param campusId - The campus ID to verify against
   * @throws NotFoundException if program doesn't exist
   * @throws ForbiddenException if program doesn't belong to the campus
   */
  async checkProgramCampusAccess(
    programId: Types.ObjectId | string,
    campusId: Types.ObjectId | string,
  ): Promise<void> {
    const program = await this.programModel.findById(programId).exec();

    if (!program) {
      throw new NotFoundException(`Program with ID ${programId} not found`);
    }

    // Convert both to strings for comparison
    const programCampusId = program.campus_id?.toString();
    const requestedCampusId = campusId.toString();

    if (programCampusId !== requestedCampusId) {
      throw new ForbiddenException(
        `Program does not belong to the specified campus`,
      );
    }
  }

  async update(
    id: Types.ObjectId,
    updateProgramDto: UpdateProgramDto,
    user: AuthenticatedRequest['user'],
  ): Promise<ProgramDocument> {
    const updatedProgram = await this.programModel
      .findByIdAndUpdate(
        id,
        { $set: updateProgramDto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedProgram) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    return updatedProgram;
  }

  /**
   * Soft delete a program
   * Prevents deletion if there are active or upcoming admission programs associated with the program
   * @param id - The program ID to soft delete
   * @param user - The authenticated user
   * @returns Soft deletion confirmation
   * @throws BadRequestException if program ID is invalid
   * @throws NotFoundException if program doesn't exist
   * @throws ForbiddenException if program has active/upcoming admission programs
   */
  async softDelete(
    id: string,
    user: AuthenticatedRequest['user'],
  ): Promise<{ deleted: boolean }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid program ID');
    }

    const programId = new Types.ObjectId(id);

    // Check if program exists
    const program = await this.programModel.findById(programId).exec();
    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    // Check if program is already deleted
    if (program._deleted) {
      throw new BadRequestException('Program is already deleted');
    }

    // Check for admission programs associated with this program
    const admissionPrograms = await this.admissionProgramModel
      .find({ program: programId })
      .exec();

    if (admissionPrograms.length > 0) {
      // Get admission IDs from admission programs
      const admissionIds = admissionPrograms.map((ap) => ap.admission);

      // Check if any admissions have future deadlines (program is "live")
      // LIVE status: at least one admission has a deadline >= now
      const now = new Date();
      const liveAdmissions = await this.admissionModel
        .find({
          _id: { $in: admissionIds },
          // Future deadline: deadline exists and is >= now
          admission_deadline: { $exists: true, $ne: null, $gte: now },
        })
        .exec();

      if (liveAdmissions.length > 0) {
        throw new ForbiddenException(
          'Cannot delete program. The program is currently "live" (has at least one admission program with a future deadline). Please close or remove the admission programs first.',
        );
      }
    }

    // Soft delete the program
    const result = await this.programModel
      .updateOne({ _id: programId }, { $set: { deleted: true } })
      .exec();

    if (result.modifiedCount === 0) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    return { deleted: true };
  }

  async findByCampus(
    campusId: Types.ObjectId,
    queryDto: QueryProgramDto,
  ): Promise<ProgramsByCampusResponseDto> {

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      populate = true,
      campus_id: _campusIdParam, // this is to be overrid
      ...restQueryDtoParams
    } = queryDto;
    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy ?? 'createdAt']: getSortOrder(sortOrder ?? 'desc') } as const;

    // Build filter query using the existing buildFilterQuery method
    const filter = this.buildFilterQuery({
      ...restQueryDtoParams,
      campus_id: campusId
    });
    // Override campus_id filter with the specific campusId
    (filter as any).campus_id = campusId;

    // Build a single base aggregation used for data, count, and available filters
    const baseAggregationStages: PipelineStage[] = [
      { $match: filter },
      // Lookup program template and merge fields (name, degree_level, field_of_study, major, tags)
      ...getTemplateLookupStages(),
      getTemplateLookupCleanupStage(),
      {
        $lookup: {
          from: DB_COLLECTIONS.ACADEMIC_DEPARTMENTS,
          localField: 'academic_departments',
          foreignField: '_id',
          as: 'dept',
        },
      },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          academic_departments: {
            $cond: [
              { $ifNull: ['$dept', false] },
              { id: { $toString: '$dept._id' }, name: '$dept.name' },
              null,
            ],
          },
        },
      },
      // Populate fee structure details
      {
        $lookup: {
          from: DB_COLLECTIONS.FEE_STRUCTURES,
          localField: 'fee_structure',
          foreignField: '_id',
          as: 'fee_structure',
        },
      },
      {
        $unwind: { path: '$fee_structure', preserveNullAndEmptyArrays: true },
      },
    ];

    const dataPipeline = [
      ...baseAggregationStages,
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      // Remove dept field as academic_departments already contains the necessary information
      { $project: { dept: 0 } },
    ];

    const countPipeline = [
      ...baseAggregationStages,
      { $count: 'total' },
    ];

    const availableFiltersPipeline = [
      ...baseAggregationStages,
      {
        $group: {
          _id: null,
          degree_level: { $addToSet: '$degree_level' },
          duration: { $addToSet: '$duration' },
          academic_departments: {
            $addToSet: { id: '$academic_departments.id', name: '$academic_departments.name' },
          },
        },
      },
      { $project: { _id: 0, degree_level: 1, duration: 1, academic_departments: 1 } },
      // Ensure academic departments are sorted ascending by name
      {
        $addFields: {
          degree_level: { $sortArray: { input: '$degree_level', sortBy: 1 } },
          duration: { $sortArray: { input: '$duration', sortBy: 1 } },
          academic_departments: {
            $sortArray: { input: '$academic_departments', sortBy: { name: 1 } },
          },
        },
      },
    ];

    const [dataDocs, countDocs, availableFiltersDoc] = await Promise.all([
      this.programModel.aggregate(dataPipeline).exec(),
      this.programModel.aggregate(countPipeline).exec(),
      this.programModel.aggregate(availableFiltersPipeline).exec(),
    ]);


    const total = Number(countDocs?.[0]?.total || 0);

    const totalPages = Math.ceil(total / limit);

    // Normalize fee structures in the results
    const normalizedPrograms = dataDocs.map((program: any) => {
      if (program.fee_structure) {
        // normalizeFeeStructure expects a Mongoose document or plain object
        // Since aggregation returns plain objects, we pass it directly
        program.fee_structure = normalizeFeeStructure(program.fee_structure as any);
      }
      return program;
    });

    // Populate references if requested
    if (populate) {
      // Implement population logic here
    }

    return {
      programs: normalizedPrograms as unknown as ProgramByCampusDto[],
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
      availableFilters:
        availableFiltersDoc?.[0] ||
        ({ degree_level: [], duration: [], academic_departments: [] }),
    };
  }

  async findByAcademicDepartment(
    departmentId: Types.ObjectId,
    queryDto: QueryProgramDto,
  ): Promise<{
    programs: ProgramDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (!Types.ObjectId.isValid(departmentId)) {
      throw new BadRequestException('Invalid academic department ID');
    }

    const {
      page = 1,
      limit = 10,
      sortBy,
      sortOrder,
      populate = true,
      search,
      name,
      major,
      mode_of_study,
      degree_level,
      duration,
    } = queryDto;
    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy ?? 'createdAt']: getSortOrder(sortOrder ?? 'desc') } as const;

    // Build filter query using the existing buildFilterQuery method
    const filter = this.buildFilterQuery(queryDto);
    // Override academic_departments filter with the specific departmentId
    (filter as any).academic_departments = departmentId;

    // Execute query with template population
    const programs = await this.programModel
      .find(filter)
      .populate('template')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Merge template fields onto each program for the response
    programs.forEach((p) => mergeProgramTemplateFields(p as Record<string, unknown>));

    // Get total count
    const total = await this.programModel
      .countDocuments(filter)
      .exec();
    const totalPages = Math.ceil(total / limit);

    return {
      programs: programs as unknown as ProgramDocument[],
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getStatistics(): Promise<any> {
    // Get count by mode of study
    const modeOfStudyStats = await this.programModel
      .aggregate([
        { $group: { _id: '$mode_of_study', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .exec();

    // Get count by campus
    const campusStats = await this.programModel
      .aggregate([
        { $group: { _id: '$campus_id', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ])
      .exec();

    // Get count by academic department
    const departmentStats = await this.programModel
      .aggregate([
        { $match: { academic_departments: { $exists: true, $ne: null } } },
        { $group: { _id: '$academic_departments', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ])
      .exec();

    // Total programs
    const totalPrograms = await this.programModel.countDocuments().exec();

    return {
      totalPrograms,
      modeOfStudyStats,
      campusStats,
      departmentStats,
    };
  }

  /**
   * Get total count of programs in the database
   * Excludes soft-deleted programs by default
   * 
   * @returns Total count of non-deleted programs
   */
  async getTotalCount(): Promise<{ total_programs_count: number }> {
    const filter: RootFilterQuery<ProgramDocument> = {
      deleted: { $ne: true },
    };
    const total = await this.programModel.countDocuments(filter).exec();
    return { total_programs_count: total };
  }

  async comparePrograms(
    compareProgramsDto: CompareProgramsDto,
  ): Promise<any[]> {
    const { programIds } = compareProgramsDto;

    // Convert string IDs to ObjectIds
    const objectIds = programIds.map((id) => stringToObjectId(id));

    const comparisonData = await this.programModel.aggregate([
      // Match the specified program IDs
      {
        $match: {
          _id: { $in: objectIds },
        },
      },
      // Lookup program template and merge fields (name, degree_level, field_of_study, major, tags)
      ...getTemplateLookupStages(),
      getTemplateLookupCleanupStage(),
      // Lookup campus details
      {
        $lookup: {
          from: 'campuses',
          let: { campusId: { $toObjectId: '$campus_id' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$campusId'] },
              },
            },
          ],
          as: 'campus',
        },
      },
      {
        $unwind: {
          path: '$campus',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup address details
      {
        $lookup: {
          from: 'addresses',
          let: { addressId: { $toObjectId: '$campus.address_id' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$addressId'] },
              },
            },
          ],
          as: 'campusAddress',
        },
      },
      {
        $unwind: {
          path: '$campusAddress',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup fee structures
      {
        $lookup: {
          from: DB_COLLECTIONS.FEE_STRUCTURES,
          localField: 'fee_structure',
          foreignField: '_id',
          as: 'fee_structure',
        },
      },
      {
        $unwind: {
          path: '$fee_structure',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Copy fee_structure to fees (object) for backward compatibility
      {
        $addFields: {
          fees: '$fee_structure', // might be null
        },
      },
      // Lookup university details
      {
        $lookup: {
          from: 'universities',
          let: { universityId: { $toObjectId: '$campus.university_id' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$universityId'] },
              },
            },
          ],
          as: 'university',
        },
      },
      {
        $unwind: {
          path: '$university',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Add tuitionFee and applicationFee fields with default values
      // Support both new fees array format and legacy fields
      {
        $addFields: {
          // Extract tuition fee from fees array if exists, otherwise use legacy field
          tuitionFee: {
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
              0,
            ],
          },
          // Extract application fee from fees array if exists, otherwise use legacy field
          applicationFee: {
            $ifNull: [
              {
                $let: {
                  vars: {
                    applicationFeeItem: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: { $ifNull: ['$fee_structure.fees', []] },
                            as: 'fee',
                            cond: { $eq: ['$$fee.type', 'application'] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    $cond: [
                      { $ne: ['$$applicationFeeItem', null] },
                      '$$applicationFeeItem.amount',
                      '$fee_structure.application_fee',
                    ],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      // Group the results
      {
        $group: {
          _id: '$_id',
          programName: { $first: '$name' },
          major: { $first: '$major' },
          fieldOfStudy: { $first: '$field_of_study' },
          tags: { $first: '$tags' },
          duration: { $first: '$duration' },
          creditHours: { $first: '$credit_hours' },
          degreeLevel: { $first: '$degree_level' },
          modeOfStudy: { $first: '$mode_of_study' },
          languageOfInstruction: { $first: '$language_of_instruction' },
          campusName: { $first: '$campus.name' },
          campusFacilities: { $first: '$campus.facilities' },
          campusLogo: { $first: '$campus.logo_url' },
          campusAddress: { $first: '$campusAddress' },
          universityName: { $first: '$university.name' },
          universityRanking: { $first: '$university.ranking' },
          totalTuitionFee: { $sum: '$tuitionFee' },
          totalApplicationFee: { $sum: '$applicationFee' },
          currency: { $first: '$fee_structure.currency' },
          // Keep fee_structure for post-processing to calculate semester fees
          fee_structure: { $first: '$fee_structure' },
        },
      },
      // Calculate total fee (legacy)
      {
        $addFields: {
          totalFee: {
            $add: ['$totalTuitionFee', '$totalApplicationFee'],
          },
        },
      },
    ]);

    // Post-process results to add computed semester fees
    // Normalize fee structures and calculate semester fees
    const processedResults = comparisonData.map((program: any) => {
      if (program.fee_structure) {
        // Normalize fee structure to get fees array and computed fields
        const normalizedFeeStructure = normalizeFeeStructure(program.fee_structure);

        // Add computed semester fees as primary fields
        program.totalFirstSemesterFee = normalizedFeeStructure?.first_semester_fee || 0;
        program.totalRegularSemesterFee = normalizedFeeStructure?.regular_semester_fee || 0;
        program.totalLastSemesterFee = normalizedFeeStructure?.last_semester_fee || 0;

        // Replace totalTuitionFee with first_semester_fee for API response
        // normalizeFeeStructure() already replaces tuition_fee with first_semester_fee
        if (typeof normalizedFeeStructure?.tuition_fee === 'number') {
          program.totalTuitionFee = normalizedFeeStructure.tuition_fee;
        }

        // Keep legacy fields for backward compatibility
        // totalApplicationFee is already set from aggregation
      } else {
        // No fee structure, set defaults
        program.totalFirstSemesterFee = 0;
        program.totalRegularSemesterFee = 0;
        program.totalLastSemesterFee = 0;
      }

      // Remove fee_structure from response (already processed)
      delete program.fee_structure;

      return program;
    });

    return processedResults;
  }

  /**
   * DEPRECATED: Use findAll instead as it now handles the extraction of campus IDs from university ID
   * @param universityId
   * @param queryDto
   * @returns
   */
  async findAllByUniversity(
    universityId: Types.ObjectId,
    queryDto: QueryProgramDto,
  ): Promise<{
    programs: ProgramDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const campusIds = await this.extractCampusIdsFromUniversityId(universityId);

    if (campusIds.length === 0) {
      return {
        programs: [],
        total: 0,
        page: 1,
        limit: queryDto.limit || 10,
        totalPages: 0,
      };
    }

    // Merge the campus IDs with the query DTO and reuse findAll
    return this.findAll({
      ...queryDto,
      campus_ids: campusIds,
      skip: queryDto.skip,
    });
  }

  /**
   * Get programs for campus admin dashboard with program status
   * @param campusId - The campus ID from the authenticated campus admin
   * @param queryDto - Query parameters including status filter and search
   * @returns Programs with program status for campus admin dashboard
   */
  async findCampusAdminPrograms(
    campusId: Types.ObjectId,
    queryDto: QueryCampusAdminProgramsDto,
  ): Promise<CampusAdminProgramsResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      status = CampusAdminProgramStatusFilterEnum.ALL,
      sortBy,
      sortOrder,
    } = queryDto;


    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy ?? 'created_at']: getSortOrder(sortOrder ?? 'desc') } as const;

    // const skip = (Number(page) - 1) * Number(limit);
    const now = new Date();

    // Base match stage - filter by campus_id and handle deleted filter
    const baseMatch: RootFilterQuery<ProgramDocument> = {
      campus_id: campusId,
    };

    // Handle deleted filter
    if (status === CampusAdminProgramStatusFilterEnum.DELETED) {
      // Only show deleted programs
      baseMatch.deleted = true;
    } else {
      // Exclude deleted programs for all other filters (ALL, LIVE, ON_HOLD)
      baseMatch.deleted = { $ne: true };
    }

    // Build a single base aggregation used for data and count pipelines
    // This ensures both pipelines stay in sync and count matches the filtered data
    const baseAggregationStages: PipelineStage[] = [
      { $match: baseMatch },
      // Lookup program template and merge fields (name, degree_level, field_of_study, major, tags)
      ...getTemplateLookupStages(),
      getTemplateLookupCleanupStage(),
      // Lookup admission programs
      {
        $lookup: {
          from: DB_COLLECTIONS.ADMISSION_PROGRAMS,
          localField: '_id',
          foreignField: 'program',
          as: 'admission_programs',
        },
      },
      // Lookup admissions to get admission details
      {
        $lookup: {
          from: DB_COLLECTIONS.ADMISSIONS,
          localField: 'admission_programs.admission',
          foreignField: '_id',
          as: 'admissions',
        },
      },
      // Lookup academic departments
      {
        $lookup: {
          from: DB_COLLECTIONS.ACADEMIC_DEPARTMENTS,
          localField: 'academic_departments',
          foreignField: '_id',
          as: 'dept',
        },
      },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      // Apply search filter (search by program name/title only)
      ...(search
        ? [
          {
            $match: {
              name: { $regex: search, $options: 'i' },
            },
          },
        ]
        : []),
      // Determine admission status
      {
        $addFields: {
          // Check if there are any admissions with future deadlines
          // LIVE status: at least one admission (linked via admission_program) has a future deadline
          // Note: $admissions array already only contains admissions linked via admission_programs
          // because the lookup uses localField: 'admission_programs.admission'
          hasFutureDeadline: {
            $anyElementTrue: {
              $map: {
                input: '$admissions',
                as: 'admission',
                in: {
                  $and: [
                    { $ne: ['$$admission.admission_deadline', null] },
                    { $ifNull: ['$$admission.admission_deadline', false] },
                    { $gte: ['$$admission.admission_deadline', now] },
                  ],
                },
              },
            },
          },
          // Check if there are any admission programs at all
          hasAdmissionPrograms: {
            $gt: [{ $size: { $ifNull: ['$admission_programs', []] } }, 0],
          },
          // Check if there are any admissions with deadlines (not null)
          hasAdmissionsWithDeadlines: {
            $anyElementTrue: {
              $map: {
                input: '$admissions',
                as: 'admission',
                in: {
                  $and: [
                    { $ne: ['$$admission.admission_deadline', null] },
                    { $ifNull: ['$$admission.admission_deadline', false] },
                  ],
                },
              },
            },
          },
          // Check if all admissions with deadlines have expired (all deadlines < now)
          // EXPIRED status: there are admissions with deadlines, but all of those deadlines are expired
          // Note: $admissions array already only contains admissions linked via admission_programs
          allDeadlinesExpired: {
            $and: [
              // There are admissions with deadlines
              {
                $anyElementTrue: {
                  $map: {
                    input: '$admissions',
                    as: 'admission',
                    in: {
                      $and: [
                        { $ne: ['$$admission.admission_deadline', null] },
                        { $ifNull: ['$$admission.admission_deadline', false] },
                      ],
                    },
                  },
                },
              },
              // But none of them have future deadlines
              {
                $not: {
                  $anyElementTrue: {
                    $map: {
                      input: '$admissions',
                      as: 'admission',
                      in: {
                        $and: [
                          { $ne: ['$$admission.admission_deadline', null] },
                          { $ifNull: ['$$admission.admission_deadline', false] },
                          { $gte: ['$$admission.admission_deadline', now] },
                        ],
                      },
                    },
                  },
                },
              },
            ],
          },
          // Format academic_departments
          academic_departments: {
            $cond: [
              { $ifNull: ['$dept', false] },
              { id: { $toString: '$dept._id' }, name: '$dept.name' },
              null,
            ],
          },
        },
      },
      // Set status based on conditions
      // If program is deleted, status is always DELETED, otherwise determine from admissions
      {
        $addFields: {
          status: {
            $cond: [
              { $eq: ['$deleted', true] },
              CampusAdminProgramStatusFilterEnum.DELETED,
              {
                $cond: [
                  // LIVE: at least one admission has a future deadline
                  { $eq: ['$hasFutureDeadline', true] },
                  CampusAdminProgramStatusFilterEnum.LIVE,
                  {
                    $cond: [
                      // EXPIRED: there are admissions but all deadlines are expired
                      { $eq: ['$allDeadlinesExpired', true] },
                      CampusAdminProgramStatusFilterEnum.EXPIRED,
                      // ON_HOLD: no admissions exist OR all admissions lack deadlines
                      CampusAdminProgramStatusFilterEnum.ON_HOLD,
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      // Filter by status if specified (skip if filtering for DELETED as it's already filtered in baseMatch)
      ...(status !== CampusAdminProgramStatusFilterEnum.ALL &&
        status !== CampusAdminProgramStatusFilterEnum.DELETED
        ? [
          {
            $match: {
              status: status,
            },
          },
        ]
        : []),
    ];

    // Data pipeline - extends base with projection, sort, skip, and limit
    const dataPipeline: PipelineStage[] = [
      ...baseAggregationStages,
      // Project only needed fields and transform intake_periods to array of strings
      {
        $project: {
          _id: 1,
          name: 1,
          academic_departments: 1,
          created_at: 1,
          duration: 1,
          credit_hours: 1,
          degree_level: 1,
          language_of_instruction: 1,
          mode_of_study: 1,
          major: 1,
          field_of_study: 1,
          tags: 1,
          intake_periods: {
            $cond: [
              { $isArray: '$intake_periods' },
              {
                $map: {
                  input: '$intake_periods',
                  as: 'period',
                  in: '$$period.intake_period',
                },
              },
              [],
            ],
          },
          status: 1,
        },
      },
      // Sort by createdAt descending
      { $sort: sort },
      // Skip and limit for pagination
      { $skip: skip },
      { $limit: Number(limit) },
    ];

    // Count pipeline - extends base with count stage only
    const countPipeline: PipelineStage[] = [
      ...baseAggregationStages,
      { $count: 'total' },
    ];

    const [programs, countResult] = await Promise.all([
      this.programModel.aggregate(dataPipeline).exec(),
      this.programModel.aggregate(countPipeline).exec(),
    ]);

    const total = Number(countResult?.[0]?.total || 0);
    const totalPages = Math.ceil(total / limit);

    return {
      programs: programs as unknown as CampusAdminProgramDto[],
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Get detailed information of a specific program by campus slug and program template seo_title_key.
   *
   * @description
   * Retrieves a single program with all related information:
   * - Program details (name, major, degree_level, duration, etc.)
   * - Campus information (name, address, slug)
   * - University information (name)
   * - Fee structure details
   * - Intake periods
   *
   * @param campusSlug - The slug of the campus (e.g., "main-campus")
   * @param seoTitleKey - The SEO title key from program template (e.g., "computer-science-bachelors")
   * @param city - Optional: Filter by city
   * @param degreeLevel - Optional: Filter by degree level
   * @returns Detailed program information or throws NotFoundException if not found
   */
  async getDetailBySlug(
    campusSlug?: string,
    seoTitleKey?: string,
    city?: string,
    degreeLevel?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any[]> {
    const pipeline: PipelineStage[] = [
      // Stage 1: Lookup program template; filter by seo_title_key only if provided
      {
        $lookup: {
          from: DB_COLLECTIONS.PROGRAM_TEMPLATES,
          localField: 'template',
          foreignField: '_id',
          as: 'template',
        },
      },
      { $unwind: { path: '$template', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          deleted: { $ne: true },
          ...(seoTitleKey
            ? { 'template.seo_title_key': { $regex: new RegExp(`^${escapeRegex(seoTitleKey)}$`, 'i') } }
            : {}),
        },
      },

      // Stage 2: Lookup campus
      {
        $lookup: {
          from: DB_COLLECTIONS.CAMPUSES,
          localField: 'campus_id',
          foreignField: '_id',
          as: 'campus',
        },
      },
      { $unwind: { path: '$campus', preserveNullAndEmptyArrays: true } },
    ];

    // Filter by campus slug only if provided
    if (campusSlug) {
      pipeline.push({
        $match: {
          'campus.slug': { $regex: new RegExp(`^${escapeRegex(campusSlug)}$`, 'i') },
        },
      });
    }

    pipeline.push(
      // Stage 3: Lookup campus address
      {
        $lookup: {
          from: DB_COLLECTIONS.ADDRESSES,
          localField: 'campus.address_id',
          foreignField: '_id',
          as: 'campus_address',
        },
      },
      { $unwind: { path: '$campus_address', preserveNullAndEmptyArrays: true } },
    );

    if (city) {
      pipeline.push({
        $match: {
          'campus_address.city': { $regex: new RegExp(`^${escapeRegex(city)}$`, 'i') },
        },
      });
    }

    if (degreeLevel) {
      pipeline.push({
        $match: {
          'template.degree_level': { $regex: new RegExp(`^${escapeRegex(degreeLevel)}$`, 'i') },
        },
      });
    }

    pipeline.push(
      // Stage 4: Lookup university
      {
        $lookup: {
          from: DB_COLLECTIONS.UNIVERSITIES,
          localField: 'campus.university_id',
          foreignField: '_id',
          as: 'university',
        },
      },
      { $unwind: { path: '$university', preserveNullAndEmptyArrays: true } },

      // Stage 5: Lookup full fee structure document (required for normalizeFeeStructure)
      {
        $lookup: {
          from: DB_COLLECTIONS.FEE_STRUCTURES,
          localField: 'fee_structure',
          foreignField: '_id',
          as: 'fee_structure',
        },
      },
      { $unwind: { path: '$fee_structure', preserveNullAndEmptyArrays: true } },

      // Stage 6: Lookup admissions via admission_programs (nested), filtered by campus
      {
        $lookup: {
          from: DB_COLLECTIONS.ADMISSION_PROGRAMS,
          let: { programId: '$_id', campusId: '$campus_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$program', '$$programId'] } } },
            {
              $lookup: {
                from: DB_COLLECTIONS.ADMISSIONS,
                let: { admissionId: '$admission', campusId: '$$campusId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$_id', '$$admissionId'] },
                          { $eq: ['$campus_id', '$$campusId'] },
                        ],
                      },
                    },
                  },
                ] as any[],
                as: 'admission_doc',
              },
            },
            { $unwind: { path: '$admission_doc', preserveNullAndEmptyArrays: false } },
            { $replaceRoot: { newRoot: '$admission_doc' } },
            { $sort: { session_year: -1 } },
          ] as any[],
          as: 'admissions',
        },
      },

      // Final projection
      {
        $project: {
          _id: 1,
          name: '$template.name',
          degree_level: '$template.degree_level',
          major: '$template.field_of_study',
          duration: 1,
          credit_hours: 1,
          language_of_instruction: 1,
          mode_of_study: 1,
          accreditations: 1,
          intake_periods: {
            $cond: [
              { $isArray: '$intake_periods' },
              {
                $map: {
                  input: '$intake_periods',
                  as: 'period',
                  in: '$$period.intake_period',
                },
              },
              [],
            ],
          },
          scholarship_options: 1,
          tags: '$template.tags',
          campus: {
            _id: '$campus._id',
            name: '$campus.name',
            slug: '$campus.slug',
            city: '$campus_address.city',
            state: '$campus_address.state',
            image: '$campus.logo_url',
            country: '$campus_address.country',
          },
          university: {
            _id: '$university._id',
            name: '$university.name',
            type: '$university.type',
            abbreviation: '$university.abbreviation',
            slug: '$university.slug',
            founded: '$university.founded',
            affiliations: '$university.affiliations',
            logo: '$university.logo_url',
            ranking: '$university.ranking',
          },
          fee_structure: 1,
          admissions: 1,
          createdAt: 1,
        },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    );

    const result = await this.programModel.aggregate(pipeline).exec();

    if (!result || result.length === 0) {
      const filters = [
        campusSlug && `campus_slug="${campusSlug}"`,
        seoTitleKey && `seo_title_key="${seoTitleKey}"`,
        city && `city="${city}"`,
        degreeLevel && `degree_level="${degreeLevel}"`,
      ]
        .filter(Boolean)
        .join(', ');

      throw new NotFoundException(
        filters ? `Program not found with filters: ${filters}` : 'No programs found',
      );
    }

    return result.map((program) => {
      if (program.fee_structure) {
        program.fee_structure = normalizeFeeStructure(program.fee_structure);
      }
      return program;
    });
  }

}