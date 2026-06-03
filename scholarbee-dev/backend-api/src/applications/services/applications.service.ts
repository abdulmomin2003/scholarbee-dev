import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  PipelineStage,
  Types,
  UpdateQuery
} from 'mongoose';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import { getDataAndCountAggPipeline, getSortOrder } from 'src/utils/db.utils';
import { AcademicDepartmentDocument } from 'src/academic-departments/schemas/academic-department.schema';
import { AdmissionProgram, AdmissionProgramCmsStatusEnum, AdmissionProgramDocument, AdmissionProgramReceivingApplicationsEnum } from 'src/admission-programs/schemas/admission-program.schema';
import { AdmissionCmsStatusEnum, AdmissionDocument } from 'src/admissions/schemas/admission.schema';
import { AuthenticatedRequest } from 'src/auth/types/auth.interface';
import { QueryCampusStatisticsDto } from 'src/campuses/dto/query-campus.dto';
import { LegalDocumentStatus } from 'src/legal-documents/schemas/legal-document.schema';
import { ApplicationNotificationService } from 'src/notification/services/application-notification.service';
import { stringToObjectId, WithObjectId } from 'src/utils/db.utils';
import { BetterOmit } from 'src/utils/typescript.utils';
import { Campus, CampusDocument } from '../../campuses/schemas/campus.schema';
import { LegalDocumentRequirementsService } from '../../legal-document-requirements/legal-document-requirements.service';
import { LegalActionType } from '../../legal-document-requirements/schemas/legal-document-requirement.schema';
import { LegalDocumentsService } from '../../legal-documents/legal-documents.service';
import {
  Program,
  ProgramDocument,
} from '../../programs/schemas/program.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { QueryApplicationDto } from '../dto/query-application.dto';
import { UpdateApplicationDto } from '../dto/update-application.dto';
import {
  ApplicantSnapshot,
  Application,
  ApplicationDocument,
  ApplicationStatus,
} from '../schemas/application.schema';
import { mergeProgramTemplateFields } from 'src/utils/program-template-lookup.utils';

interface FindAllOptions extends QueryApplicationDto {
  excludeStatus?: ApplicationStatus[];
}

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    @InjectModel(AdmissionProgram.name)
    private admissionProgramModel: Model<AdmissionProgramDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Program.name)
    private programModel: Model<ProgramDocument>,
    @InjectModel(Campus.name)
    private campusModel: Model<CampusDocument>,
    private readonly legalDocumentRequirementsService: LegalDocumentRequirementsService,
    private readonly legalDocumentsService: LegalDocumentsService,
    private readonly applicationNotificationService: ApplicationNotificationService,
  ) { }

  /**
   * Fetches application details including program and campus information
   * @param application The application document
   * @returns Application details for email templates
   */
  private async getApplicationDetails(
    application: ApplicationDocument,
  ): Promise<{
    programName: string;
    institute: string;
    educationLevel: string;
  }> {
    // Fetch program details with template for name/degree_level
    const program = await this.programModel
      .findById(application.program)
      .populate('template')
      .lean();
    if (!program) {
      throw new Error(`Program not found for application ${application._id}`);
    }

    // Merge template fields (name, degree_level) from the referenced template
    mergeProgramTemplateFields(program as Record<string, unknown>);

    // Fetch campus details
    const campus = await this.campusModel
      .findById(application.campus_id)
      .lean();
    if (!campus) {
      throw new Error(`Campus not found for application ${application._id}`);
    }

    return {
      programName: program.name as string,
      institute: campus.name, // Use campus name as institute
      educationLevel: program.degree_level as string,
    };
  }

  /**
     * Creates an applicant snapshot by fetching user from database
     * @param applicantId The applicant user ID
     * @returns The applicant snapshot object
     */
  private async createApplicantSnapshot(applicantId: string): Promise<ApplicantSnapshot> {
    const user = await this.userModel.findById(applicantId).lean().exec();
    if (!user) {
      throw new NotFoundException('Applicant user not found');
    }

    // 1. Define this array OUTSIDE your method (e.g., at the top of the file or just above the class)
    // The 'as const' locks the array into a read-only tuple of literal strings, allowing TS to extract the exact keys.
    const REQUIRED_SNAPSHOT_FIELDS = [
      // Available at signup
      'email',
      'phone_number',
      'user_type', // automatically set to Student

      // Missing at signup
      'first_name',
      'last_name',
      'full_name',
      'date_of_birth',
      'special_person',
      'gender',
      'provinceOfDomicile',
      'districtOfDomicile',
      'stateOrProvince',
      'city',
      'postalCode',
      'streetAddress',
      'educational_backgrounds',
    ] as const satisfies (keyof User)[];

    // 2. Use the constant array for your runtime check
    const missingFields = REQUIRED_SNAPSHOT_FIELDS.filter(
      (field) => user[field] === null || user[field] === undefined,
    );

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Your profile is incomplete. Please update the following details before submitting an application: ${missingFields.join(
          ', ',
        )}`,
      );
    }

    // Extract the union type of these exact strings
    type RequiredSnapshotKeys = (typeof REQUIRED_SNAPSHOT_FIELDS)[number];

    // 3. THE TYPE ASSERTION (The "Type Guard")
    // We create a new reference 'validUser' and intersect the original Mongoose type
    // with a strict 'Pick' from ApplicantSnapshot. This strips away the 'undefined' possibilities.
    const validUser = user as typeof user & Pick<ApplicantSnapshot, RequiredSnapshotKeys>;

    // 4. Now use 'validUser' instead of 'user' for mapping. TypeScript will no longer complain.
    const snapshot: ApplicantSnapshot = {
      // --- Required Fields ---
      first_name: validUser.first_name,
      last_name: validUser.last_name,
      full_name: validUser.full_name,
      email: validUser.email,
      phone_number: validUser.phone_number,
      date_of_birth: validUser.date_of_birth,
      special_person: validUser.special_person,
      gender: validUser.gender,
      provinceOfDomicile: validUser.provinceOfDomicile,
      districtOfDomicile: validUser.districtOfDomicile,
      stateOrProvince: validUser.stateOrProvince,
      city: validUser.city,
      postalCode: validUser.postalCode,
      streetAddress: validUser.streetAddress,
      user_type: validUser.user_type,
      educational_backgrounds: validUser.educational_backgrounds,

      // --- Optional Fields (Fallback to the original 'user' object here if needed, or validUser, both work) ---
      ...(validUser.father_name !== undefined && { father_name: validUser.father_name }),
      ...(validUser.father_profession !== undefined && { father_profession: validUser.father_profession }),
      ...(validUser.father_status !== undefined && { father_status: validUser.father_status }),
      ...(validUser.father_income !== undefined && { father_income: validUser.father_income }),
      ...(validUser.religion !== undefined && { religion: validUser.religion }),
      ...(validUser.nationality !== undefined && { nationality: validUser.nationality }),
      ...(validUser.profile_image_url !== undefined && { profile_image_url: validUser.profile_image_url }),
      ...(validUser.national_id_card !== undefined && { national_id_card: validUser.national_id_card }),
      ...(user.student_id !== undefined &&
        user.student_id !== null &&
        user.student_id !== '' && { student_id: user.student_id }),
    };

    return snapshot;
  }

  /**
   * Helper method to populate preferences.program for backward compatibility
   * 
   * Handles two scenarios:
   * 1. Legacy data: program stored as string (before schema fix) - converts to ObjectId and populates from AdmissionProgram
   * 2. New data: program stored as ObjectId - Mongoose populate handles this automatically
   * 
   * Note: preferences.program references AdmissionProgram, not Program
   * This ensures backward compatibility with existing database records that may have
   * program values stored as strings instead of ObjectIds.
   */
  private async populatePreferencesProgram(
    application: ApplicationDocument | ApplicationDocument[],
  ): Promise<void> {
    const applications = Array.isArray(application) ? application : [application];

    for (const app of applications) {
      if (!app.departments) continue;

      for (const department of app.departments) {
        if (!department.preferences) continue;

        for (const preference of department.preferences) {
          const program = preference.program as any;

          // Skip if program is already fully populated (has nested program with 'name')
          if (
            program &&
            typeof program === 'object' &&
            program !== null &&
            !(program instanceof Types.ObjectId) &&
            program.program &&
            typeof program.program === 'object' &&
            'name' in program.program
          ) {
            continue; // Already fully populated by Mongoose, skip
          }

          // Check if admission program is populated but nested program is not
          if (
            program &&
            typeof program === 'object' &&
            program !== null &&
            !(program instanceof Types.ObjectId) &&
            program._id &&
            (!program.program ||
              (typeof program.program === 'object' &&
                !('name' in program.program)))
          ) {
            // Admission program is populated but program is not, populate it
            try {
              const admissionProgramId =
                program._id instanceof Types.ObjectId
                  ? program._id
                  : new Types.ObjectId(program._id.toString());
              const admissionProgram = await this.admissionProgramModel
                .findById(admissionProgramId)
                .populate('program')
                .lean();
              if (admissionProgram) {
                preference.program = admissionProgram as any;
              }
            } catch (error) {
              console.warn(
                `Failed to populate program in admission program: ${program._id}`,
              );
            }
            continue;
          }

          // Handle legacy string values - Mongoose populate only works on ObjectId values
          if (program && typeof program === 'string') {
            try {
              const programId = new Types.ObjectId(program);
              const admissionProgram = await this.admissionProgramModel
                .findById(programId)
                .populate('program')
                .lean();
              if (admissionProgram) {
                preference.program = admissionProgram as any;
              }
            } catch (error) {
              // Invalid ObjectId string, leave as is
              console.warn(
                `Invalid admission program ID in preference: ${program}`,
              );
            }
          }
          // Note: If program is an ObjectId but not populated, Mongoose populate should have handled it.
          // If it didn't populate, the referenced AdmissionProgram document may not exist.
        }
      }
    }
  }

  /**
   * Get application associated legal documents
   * This method checks the legal document requirements for application action
   * and returns the actual legal documents required for the application
   */
  async getApplicationLegalDocuments() {
    // Get the requirements for student program application action type
    const legalDocumentRequirementDoc =
      await this.legalDocumentRequirementsService.findByActionType(
        LegalActionType.STUDENT_PROGRAM_APPLICATION,
      );

    if (!legalDocumentRequirementDoc) return [];

    const allRequiredDocumentTypes =
      legalDocumentRequirementDoc.required_document_types;

    // Find all the legal documents against the required document types that are active
    const associatedLegalDocuments = await this.legalDocumentsService.findAll({
      document_types: allRequiredDocumentTypes,
      status: LegalDocumentStatus.ACTIVE,
    });

    if (!associatedLegalDocuments.length) {
      return [];
    }

    return associatedLegalDocuments;
  }

  /**
   * Validates that the applicant has accepted all required legal documents and returns the filtered list
   * of accepted documents that match the requirements.
   *
   * @param acceptedLegalDocuments Array of accepted legal document IDs
   * @returns Filtered array of accepted legal document IDs that match requirements
   * @throws BadRequestException if any required document is not accepted
   */
  private async validateAndFilterAcceptedLegalDocuments(
    acceptedLegalDocuments: Types.ObjectId[] = [],
  ): Promise<Types.ObjectId[]> {
    // Get required documents
    const requiredDocuments = await this.getApplicationLegalDocuments();

    // If no required documents, then return empty array (no documents required)
    if (requiredDocuments.length === 0) {
      return [];
    }

    // If no accepted legal documents, then throw error (no documents accepted)
    if (!acceptedLegalDocuments?.length) {
      throw new BadRequestException('Legal documents acceptance is required');
    }

    const requiredLegalDocumentIds = requiredDocuments.map((doc) =>
      doc._id.toString(),
    );

    // Create Sets for O(1) lookups
    const requiredDocSet = new Set(requiredLegalDocumentIds);
    const acceptedDocSet = new Set(
      acceptedLegalDocuments.map((doc) => doc.toString()),
    );

    // Find any missing required documents
    const isMissingReqDocs = requiredLegalDocumentIds.some((reqDocId) => {
      const isAccepted = acceptedDocSet.has(reqDocId);
      return !isAccepted;
    });

    if (isMissingReqDocs) {
      throw new BadRequestException(
        `Missing acceptance for required legal documents`,
      );
    }

    // Filter accepted documents to only include required ones (Ignore the accepted documents that are not required)
    return acceptedLegalDocuments.filter((acceptedDocId) =>
      requiredDocSet.has(acceptedDocId.toString()),
    );
  }


  /**
   * Aggregation-based equivalent of previous findAll.
   * Produces the exact same response shape as findAll but uses MongoDB aggregation
   * pipeline ($lookup / $unwind) instead of Mongoose populate.
   *
   * Populated fields (when populate = true):
   *  - applicant      → users            (_id, first_name, last_name, email, phone_number)
   *  - program        → programs         (_id, name)
   *  - program_id     → programs         (_id)          [deprecated – kept for backward compat]
   *  - campus_id      → campuses         (_id, university_id, name)
   *  - admission_id   → admissions       (_id)
   *  - admission_program_id → admission_programs (_id)
   *  - departments[].department → academic_departments (_id)
   *
   * Note: departments[].preferences[].program is NOT populated (same as findAll).
   */
  /**
     * Aggregation-based equivalent of findAll.
     * Produces the same response shape as findAll but uses MongoDB aggregation
     * pipeline ($lookup / $unwind) instead of Mongoose populate, and additionally
     * enriches each preference with program_name, program_id, and admission_program_id.
     *
     * @see buildApplicationAggPipeline for the full pipeline definition.
     */
  async findAll(
    queryDto: FindAllOptions,
  ): Promise<{ data: any[]; meta: any }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      populate = true,
    } = queryDto;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: getSortOrder(sortOrder as 'asc' | 'desc') };

    // Build the full aggregation filter pipeline via the private helper
    const filterPipeline = this.buildApplicationAggPipeline(queryDto, populate);

    const { dataPipeline, countPipeline } = getDataAndCountAggPipeline(
      filterPipeline,
      sort,
      limit,
      skip,
    );

    const [applications, countDocArr] = await Promise.all([
      this.applicationModel.aggregate(dataPipeline).exec(),
      this.applicationModel.aggregate(countPipeline).exec(),
    ]);

    const total = Number(countDocArr.at(0)?.total ?? 0);

    return {
      data: applications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Return only submitted (non-draft) applications.
   *
   * Intended for admin-facing listing flows where draft applications should
   * never be visible. Admins read applicant details from applicant_snapshot
   * (including student_id when present), so populate is forced to false to skip
   * user collection lookups.
   *
   * The base findAll method remains generic for internal consumers, including
   * student-facing flows such as /applications/my-applications.
   */
  async findAllSubmitted(
    queryDto: QueryApplicationDto,
  ): Promise<{ data: any[]; meta: any }> {
    return this.findAll({
      ...queryDto,
      excludeStatus: [ApplicationStatus.DRAFT],
      populate: false,
    });
  }

  /**
   * @deprecated One-time migration helper. Remove after all environments are
   * backfilled; new submissions persist student_id via createApplicantSnapshot().
   */
  async backfillApplicantSnapshotStudentIds(): Promise<{
    matched: number;
    updated: number;
    skippedNoUserStudentId: number;
  }> {
    const candidates = await this.applicationModel.aggregate<{
      _id: Types.ObjectId;
      student_id: string;
    }>([
      {
        $match: {
          applicant_snapshot: { $exists: true, $ne: null },
          applicant: { $exists: true, $ne: null },
          $or: [
            { 'applicant_snapshot.student_id': { $exists: false } },
            { 'applicant_snapshot.student_id': null },
            { 'applicant_snapshot.student_id': '' },
          ],
        },
      },
      {
        $lookup: {
          from: DB_COLLECTIONS.USERS,
          localField: 'applicant',
          foreignField: '_id',
          as: '__user',
        },
      },
      { $unwind: { path: '$__user', preserveNullAndEmptyArrays: false } },
      {
        $match: {
          '__user.student_id': { $exists: true, $nin: [null, ''] },
        },
      },
      {
        $project: {
          _id: 1,
          student_id: '$__user.student_id',
        },
      },
    ]);

    const matched = candidates.length;

    if (matched === 0) {
      const pendingWithoutUserId = await this.applicationModel.countDocuments({
        applicant_snapshot: { $exists: true, $ne: null },
        $or: [
          { 'applicant_snapshot.student_id': { $exists: false } },
          { 'applicant_snapshot.student_id': null },
          { 'applicant_snapshot.student_id': '' },
        ],
      });

      return {
        matched: 0,
        updated: 0,
        skippedNoUserStudentId: pendingWithoutUserId,
      };
    }

    const bulkOps = candidates.map(({ _id, student_id }) => ({
      updateOne: {
        filter: { _id },
        update: { $set: { 'applicant_snapshot.student_id': student_id } },
      },
    }));

    const bulkResult = await this.applicationModel.bulkWrite(bulkOps);

    const stillMissing = await this.applicationModel.countDocuments({
      applicant_snapshot: { $exists: true, $ne: null },
      $or: [
        { 'applicant_snapshot.student_id': { $exists: false } },
        { 'applicant_snapshot.student_id': null },
        { 'applicant_snapshot.student_id': '' },
      ],
    });

    return {
      matched,
      updated: bulkResult.modifiedCount,
      skippedNoUserStudentId: stillMissing,
    };
  }

  /**
   * Core aggregation engine for Application list retrieval.
   *
   * Centralises all pipeline stages so that findAll (and any future methods
   * that need the same joins) remain clean and DRY.
   *
   * Pipeline stages (when populate = true):
   *  1. $match           – filter by program, campus, admission, status, applicant
   *  2. $lookup/$unwind  – applicant (users)
   *  3. $lookup/$unwind  – program (programs)
   *  4. $lookup/$unwind  – program_id deprecated (programs)
   *  5. $lookup/$unwind  – campus_id (campuses)
   *  6. $lookup/$unwind  – admission_id (admissions)
   *  7. $lookup/$unwind  – admission_program_id (admission_programs)
   *  8. $lookup          – departments[].department (academic_departments) → __deptDocs
   *  9. $addFields       – remap departments with populated department {_id}
   * 10. $lookup          – preferences[].program (admission_programs → programs) → __prefAdmProgDocs
   * 11. $addFields       – enrich preferences with admission_program_id, program_id, program_name
   * 12. $project         – remove temp fields (__deptDocs, __prefAdmProgDocs)
   *
   * @param queryDto  - The incoming query DTO (filters only; pagination/sort handled by caller)
   * @param populate  - Whether to add lookup/unwind stages
   * @private
   */
  private buildApplicationAggPipeline(
    queryDto: FindAllOptions,
    populate: boolean,
  ): PipelineStage[] {
    const {
      search,
      program,
      admission_id,
      admission_program_id,
      applicant_id,
      campus_id,
      status,
      excludeStatus,
    } = queryDto;

    // ── Stage 1: $match ───────────────────────────────────────────────────────
    const matchConditions: Record<string, any> = {};
    if (program) matchConditions.program = program;
    if (campus_id) matchConditions.campus_id = campus_id;
    if (admission_id) matchConditions.admission_id = admission_id;
    if (admission_program_id) matchConditions.admission_program_id = admission_program_id;
    if (applicant_id) matchConditions.applicant = applicant_id;
    if (status?.length || excludeStatus?.length) {
      matchConditions.status = {
        ...(status?.length ? { $in: status } : {}),
        ...(excludeStatus?.length ? { $nin: excludeStatus } : {}),
      };
    }

    if (search && !populate) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      matchConditions.$or = [
        { 'applicant_snapshot.full_name': searchRegex },
        { 'applicant_snapshot.first_name': searchRegex },
        { 'applicant_snapshot.last_name': searchRegex },
        { 'applicant_snapshot.student_id': searchRegex },
      ];
    }

    const pipeline: PipelineStage[] = [{ $match: matchConditions }];

    if (!populate) return pipeline;

    // ── Stage 2: applicant (users) → _id, first_name, last_name, email, phone_number, student_id
    pipeline.push(
      {
        $lookup: {
          from: DB_COLLECTIONS.USERS,
          let: { applicantId: '$applicant' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$applicantId'] } } },
            { $project: { _id: 1, first_name: 1, last_name: 1, email: 1, phone_number: 1, student_id: 1 } },
          ],
          as: 'applicant',
        },
      },
      { $unwind: { path: '$applicant', preserveNullAndEmptyArrays: true } },
    );

    // ── Stage 2b: text search across populated applicant name fields ──────────
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');

      pipeline.push({
        $match: {
          $or: [
            { 'applicant.first_name': searchRegex },
            { 'applicant.last_name': searchRegex },
            { 'applicant.student_id': searchRegex },
          ],
        },
      });
    }

    // ── Stage 3: program (programs) → _id, name (sourced from template if available)
    pipeline.push(
      {
        $lookup: {
          from: DB_COLLECTIONS.PROGRAMS,
          let: { programId: '$program' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$programId'] } } },
            // Lookup template to source name from template
            {
              $lookup: {
                from: DB_COLLECTIONS.PROGRAM_TEMPLATES,
                localField: 'template',
                foreignField: '_id',
                as: '__tpl',
              },
            },
            { $unwind: { path: '$__tpl', preserveNullAndEmptyArrays: true } },
            {
              $addFields: {
                name: { $ifNull: ['$__tpl.name', '$name'] }, /* TEMPLATE_FALLBACK */
              },
            },
            { $project: { _id: 1, name: 1 } },
          ],
          as: 'program',
        },
      },
      { $unwind: { path: '$program', preserveNullAndEmptyArrays: true } },
    );

    // ── Stage 4: program_id deprecated (programs) → _id only
    pipeline.push(
      {
        $lookup: {
          from: DB_COLLECTIONS.PROGRAMS,
          let: { programIdDeprecated: '$program_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$programIdDeprecated'] } } },
            { $project: { _id: 1 } },
          ],
          as: 'program_id',
        },
      },
      { $unwind: { path: '$program_id', preserveNullAndEmptyArrays: true } },
    );

    // ── Stage 5: campus_id (campuses) → _id, university_id, name
    pipeline.push(
      {
        $lookup: {
          from: DB_COLLECTIONS.CAMPUSES,
          let: { campusId: '$campus_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$campusId'] } } },
            { $project: { _id: 1, university_id: 1, name: 1 } },
          ],
          as: 'campus_id',
        },
      },
      { $unwind: { path: '$campus_id', preserveNullAndEmptyArrays: true } },
    );

    // ── Stage 6: admission_id (admissions) → _id only
    pipeline.push(
      {
        $lookup: {
          from: DB_COLLECTIONS.ADMISSIONS,
          let: { admissionId: '$admission_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$admissionId'] } } },
            { $project: { _id: 1 } },
          ],
          as: 'admission_id',
        },
      },
      { $unwind: { path: '$admission_id', preserveNullAndEmptyArrays: true } },
    );

    // ── Stage 7: admission_program_id (admission_programs) → _id only
    pipeline.push(
      {
        $lookup: {
          from: DB_COLLECTIONS.ADMISSION_PROGRAMS,
          let: { admissionProgramId: '$admission_program_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$admissionProgramId'] } } },
            { $project: { _id: 1 } },
          ],
          as: 'admission_program_id',
        },
      },
      { $unwind: { path: '$admission_program_id', preserveNullAndEmptyArrays: true } },
    );

    // ── Stage 8: departments[].department (academic_departments) → __deptDocs
    // Batch-lookup: collect all dept ObjectIds, look them up once, store in __deptDocs.
    pipeline.push({
      $lookup: {
        from: DB_COLLECTIONS.ACADEMIC_DEPARTMENTS,
        let: {
          deptIds: {
            $map: {
              input: { $ifNull: ['$departments', []] },
              as: 'dept',
              in: '$$dept.department',
            },
          },
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$_id', { $map: { input: '$$deptIds', as: 'id', in: { $toObjectId: '$$id' } } }],
              },
            },
          },
          { $project: { _id: 1 } },
        ],
        as: '__deptDocs',
      },
    });

    // ── Stage 9: remap departments — populate department {_id}, keep all subdoc fields
    pipeline.push({
      $addFields: {
        departments: {
          $map: {
            input: { $ifNull: ['$departments', []] },
            as: 'dept',
            in: {
              _id: '$$dept._id',
              created_at: '$$dept.created_at',
              updated_at: '$$dept.updated_at',
              department: {
                $let: {
                  vars: {
                    matched: {
                      $filter: {
                        input: '$__deptDocs',
                        as: 'doc',
                        cond: { $eq: ['$$doc._id', { $toObjectId: '$$dept.department' }] },
                      },
                    },
                  },
                  in: {
                    $cond: {
                      if: { $gt: [{ $size: '$$matched' }, 0] },
                      then: { $arrayElemAt: ['$$matched', 0] },
                      else: null,
                    },
                  },
                },
              },
              // preferences carried forward as-is; enriched in Stage 11
              preferences: '$$dept.preferences',
            },
          },
        },
      },
    });

    // ── Stage 10: batch-lookup admission_programs for all preferences
    // Flattens all preferences[].program ids across departments, looks up
    // admission_programs (with nested programs join) in one query → __prefAdmProgDocs.
    pipeline.push({
      $lookup: {
        from: DB_COLLECTIONS.ADMISSION_PROGRAMS,
        let: {
          allPrefProgIds: {
            $reduce: {
              input: { $ifNull: ['$departments', []] },
              initialValue: [],
              in: {
                $concatArrays: [
                  '$$value',
                  { $map: { input: { $ifNull: ['$$this.preferences', []] }, as: 'pref', in: '$$pref.program' } },
                ],
              },
            },
          },
        },
        pipeline: [
          { $match: { $expr: { $in: ['$_id', '$$allPrefProgIds'] } } },
          {
            $lookup: {
              from: DB_COLLECTIONS.PROGRAMS,
              let: { programRef: '$program' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$programRef'] } } },
                // Lookup template to source name from template
                {
                  $lookup: {
                    from: DB_COLLECTIONS.PROGRAM_TEMPLATES,
                    localField: 'template',
                    foreignField: '_id',
                    as: '__tpl',
                  },
                },
                { $unwind: { path: '$__tpl', preserveNullAndEmptyArrays: true } },
                {
                  $addFields: {
                    name: { $ifNull: ['$__tpl.name', '$name'] }, /* TEMPLATE_FALLBACK */
                  },
                },
                { $project: { _id: 1, name: 1 } },
              ],
              as: '__programDoc',
            },
          },
          { $unwind: { path: '$__programDoc', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              program_id: '$__programDoc._id',
              program_name: '$__programDoc.name',
            },
          },
        ],
        as: '__prefAdmProgDocs',
      },
    });

    // ── Stage 11: enrich preferences with admission_program_id, program_id, program_name
    pipeline.push({
      $addFields: {
        departments: {
          $map: {
            input: { $ifNull: ['$departments', []] },
            as: 'dept',
            in: {
              _id: '$$dept._id',
              created_at: '$$dept.created_at',
              updated_at: '$$dept.updated_at',
              department: '$$dept.department',
              preferences: {
                $map: {
                  input: { $ifNull: ['$$dept.preferences', []] },
                  as: 'pref',
                  in: {
                    _id: '$$pref._id',
                    created_at: '$$pref.created_at',
                    updated_at: '$$pref.updated_at',
                    program: '$$pref.program',
                    preference_order: '$$pref.preference_order',
                    // ── 3 enriched fields ─────────────────────────────────────
                    admission_program_id: '$$pref.program',
                    program_id: {
                      $let: {
                        vars: {
                          admProg: {
                            $arrayElemAt: [
                              { $filter: { input: '$__prefAdmProgDocs', as: 'ap', cond: { $eq: ['$$ap._id', '$$pref.program'] } } },
                              0,
                            ],
                          },
                        },
                        in: '$$admProg.program_id',
                      },
                    },
                    program_name: {
                      $let: {
                        vars: {
                          admProg: {
                            $arrayElemAt: [
                              { $filter: { input: '$__prefAdmProgDocs', as: 'ap', cond: { $eq: ['$$ap._id', '$$pref.program'] } } },
                              0,
                            ],
                          },
                        },
                        in: '$$admProg.program_name',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // ── Stage 12: cleanup — remove temp lookup arrays
    pipeline.push({ $project: { __deptDocs: 0, __prefAdmProgDocs: 0 } });

    return pipeline;
  }

  async getCampusStatistics(
    campusId: Types.ObjectId,
    query: QueryCampusStatisticsDto,
  ) {
    const { year } = query;

    const pipeline: PipelineStage[] = [];

    // Match by campusId if provided
    if (campusId) {
      pipeline.push({
        $match: {
          campus_id: { $eq: campusId },
        },
      });
    }

    // Filter out the draft applications
    pipeline.push({
      $match: {
        status: { $ne: ApplicationStatus.DRAFT },
      },
    });

    // Match by year if provided
    if (year) {
      pipeline.push({
        $match: {
          submission_date: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year}-12-31`),
          },
        },
      });
    }

    // Group stats based on status - include all statuses that are used in the list query
    pipeline.push({
      $group: {
        _id: null,
        totalReceived: { $sum: 1 },
        totalApproved: {
          $sum: {
            $cond: [{ $eq: ['$status', ApplicationStatus.APPROVED] }, 1, 0],
          },
        },
        totalRejected: {
          $sum: {
            $cond: [{ $eq: ['$status', ApplicationStatus.REJECTED] }, 1, 0],
          },
        },
        totalPending: {
          $sum: {
            $cond: [
              {
                $in: [
                  '$status',
                  [ApplicationStatus.PENDING, ApplicationStatus.UNDER_REVIEW],
                ],
              },
              1,
              0,
            ],
          },
        },
        dailyReceived: {
          $sum: {
            $cond: [
              {
                $gte: [
                  '$submission_date',
                  new Date(Date.now() - 24 * 60 * 60 * 1000),
                ],
              }, // 24 hours ago
              1,
              0,
            ],
          },
        },
        dailyApproved: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', ApplicationStatus.APPROVED] },
                  {
                    $gte: [
                      '$submission_date',
                      new Date(Date.now() - 24 * 60 * 60 * 1000),
                    ],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
        dailyRejected: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', ApplicationStatus.REJECTED] },
                  {
                    $gte: [
                      '$submission_date',
                      new Date(Date.now() - 24 * 60 * 60 * 1000),
                    ],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
        dailyPending: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $in: [
                      '$status',
                      [
                        ApplicationStatus.PENDING,
                        ApplicationStatus.UNDER_REVIEW,
                      ],
                    ],
                  },
                  {
                    $gte: [
                      '$submission_date',
                      new Date(Date.now() - 24 * 60 * 60 * 1000),
                    ],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    });

    // Run aggregation
    const result = await this.applicationModel.aggregate<
      | {
        totalReceived: number;
        dailyReceived: number;
        totalApproved: number;
        totalRejected: number;
        totalPending: number;
        dailyApproved: number;
        dailyRejected: number;
        dailyPending: number;
      }
      | undefined
      | null
    >(pipeline);
    const stats = result.at(0);

    return {
      receivedAdmissions: {
        count: stats?.totalReceived || 0,
        daily: stats?.dailyReceived || 0,
      },
      approvedAdmissions: {
        count: stats?.totalApproved || 0,
        daily: stats?.dailyApproved || 0,
      },
      rejectedAdmissions: {
        count: stats?.totalRejected || 0,
        daily: stats?.dailyRejected || 0,
      },
      pendingAdmissions: {
        count: stats?.totalPending || 0,
        daily: stats?.dailyPending || 0,
      },
    };
  }

  async findOne(
    applicationId: Types.ObjectId,
    populate: boolean = true,
  ): Promise<ApplicationDocument> {
    let query = this.applicationModel.findById(applicationId);

    if (populate) {
      query = query
        .populate('applicant')
        .populate('admission_id')
        .populate('campus_id')
        .populate('program')
        .populate('admission_program_id')
        .populate({
          path: 'departments.department',
          model: 'AcademicDepartment',
        });
      // Note: departments.preferences.program is NOT populated - it returns only the ObjectId (admission program ID)
    }

    const application = await query.exec();

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found`,
      );
    }

    // Note: preferences.program is not populated - it returns only the ObjectId (admission program ID)

    return application;
  }

  async findByApplicant(
    applicantId: string,
    queryDto: QueryApplicationDto,
  ): Promise<{ data: ApplicationDocument[]; meta: any }> {
    return this.findAll({
      ...queryDto,
      applicant_id: stringToObjectId(applicantId) as Types.ObjectId,
    });
  }

  async update(
    applicationId: Types.ObjectId,
    updateApplicationDto: UpdateApplicationDto,
    user: AuthenticatedRequest['user'],
  ): Promise<ApplicationDocument> {

    // Check if application is already submitted (Pending status means submitted)
    const existingApplication = await this.applicationModel
      .findById(applicationId)
      .exec();
    if (!existingApplication) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found`,
      );
    }

    // Prevent updates to submitted applications (status other than DRAFT)
    if (existingApplication.status !== ApplicationStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update application after submission.`,
      );
    }

    const { accepted_legal_documents, ...restUpdateApplicationDto } =
      updateApplicationDto;
    // Note: admission_program_id cannot be updated - it's fixed at creation time
    let updatedDocument: UpdateQuery<ApplicationDocument> =
      restUpdateApplicationDto;


    // Get expected department ID from existing application's admission_program_id
    let expectedDepartmentId: string | null = null;
    const admissionProgram = await this.admissionProgramModel
      .findById(existingApplication.admission_program_id)
      .populate<{
        program: null | Pick<WithObjectId<ProgramDocument>, '_id' | 'academic_departments'> & {
          academic_departments: null | Pick<WithObjectId<AcademicDepartmentDocument>, '_id'>;
        }
      }>({
        path: 'program',
        select: '_id academic_departments',
        populate: { path: 'academic_departments', select: '_id' }
      })
      .lean();

    if (admissionProgram?.program?.academic_departments) {
      expectedDepartmentId = admissionProgram.program.academic_departments._id.toString();
    }

    // If preferences are being updated, validate and transform preferences
    if (restUpdateApplicationDto.preferences) {
      if (!expectedDepartmentId) {
        throw new BadRequestException(
          'Cannot validate preferences: unable to determine expected department from existing admission_program_id',
        );
      }

      // Validate preferences admission_program_ids and ensure they all belong to the same department
      for (const preference of restUpdateApplicationDto.preferences) {
        const admissionProgramId = preference.admission_program_id;
        if (!admissionProgramId) {
          throw new BadRequestException(
            `Preference is missing admission_program_id`,
          );
        }

        // Validate that the admission program exists and get its department
        const prefAdmissionProgram = await this.admissionProgramModel
          .findById(admissionProgramId)
          .populate<{
            program: null | Pick<WithObjectId<ProgramDocument>, '_id' | 'academic_departments'> & {
              academic_departments: null | Pick<WithObjectId<AcademicDepartmentDocument>, '_id'>;
            }
          }>({
            path: 'program',
            select: '_id academic_departments',
            populate: { path: 'academic_departments', select: '_id' }
          })
          .lean();

        if (!prefAdmissionProgram) {
          throw new NotFoundException(
            `Admission Program with ID ${admissionProgramId} in preferences not found`,
          );
        }

        // Validate that the preference's department matches the expected department
        const prefDepartmentId = prefAdmissionProgram.program?.academic_departments?._id?.toString();
        if (!prefDepartmentId || prefDepartmentId !== expectedDepartmentId) {
          throw new BadRequestException(
            `All preferences must belong to the same department. Preference with Admission Program ID ${admissionProgramId} belongs to department ${prefDepartmentId || 'unknown'}, but expected department is ${expectedDepartmentId}`,
          );
        }
      }

      // Transform preferences: convert from DTO structure to database structure
      // DTO has: preferences (array of PreferenceDto)
      // Database expects: departments (array with single department object containing preferences)
      updatedDocument.departments = [
        {
          department: expectedDepartmentId, // From existing application's admission_program_id
          preferences: restUpdateApplicationDto.preferences.map((pref) => ({
            program: pref.admission_program_id, // Schema expects 'program' field to reference AdmissionProgram
            preference_order: pref.preference_order,
          })),
        },
      ] as any;
    }

    // Validate and filter the accepted_legal_documents BEFORE submission
    if (updateApplicationDto.is_submitted) {
      // Note: Email verification is checked by EmailVerifiedGuard at the controller level
      // Validate and filter the accepted_legal_documents
      const validatedAndFilteredAcceptedLegalDocuments =
        await this.validateAndFilterAcceptedLegalDocuments(
          updateApplicationDto.accepted_legal_documents,
        );

      // Create applicant snapshot on submission using authenticated user ID
      const applicant_snapshot = await this.createApplicantSnapshot(user._id);

      updatedDocument.status = ApplicationStatus.PENDING; // "Pending" status is set when application is submitted (when updatedApplicationDto.is_submitted is true)
      updatedDocument.applicant_snapshot = applicant_snapshot;
      updatedDocument.accepted_legal_documents =
        validatedAndFilteredAcceptedLegalDocuments;
    }

    const updatedApplication = await this.applicationModel
      .findByIdAndUpdate(applicationId, updatedDocument, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedApplication) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found`,
      );
    }

    // Trigger notification for application submission POST submission
    if (updateApplicationDto.is_submitted) {
      try {
        const notification =
          await this.applicationNotificationService.applicationSubmission(
            updatedApplication,
          );
        if (!notification) {
          console.log(
            'No notification sent - no campus ID available for this application',
          );
        }
      } catch (error) {
        console.error('Error sending submission notification:', error);
        // Don't fail the application update if notification fails
      }
    }

    return updatedApplication;
  }

  async updateStatus(
    applicationId: Types.ObjectId,
    status: Extract<
      ApplicationStatus,
      | ApplicationStatus.APPROVED
      | ApplicationStatus.REJECTED
      | ApplicationStatus.UNDER_REVIEW
    >,
  ): Promise<ApplicationDocument> {
    const updatedApplication = await this.applicationModel
      .findByIdAndUpdate(
        applicationId,
        { status },
        { new: true, runValidators: true },
      )
      .lean()
      .exec();

    if (!updatedApplication) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found`,
      );
    }

    // TODO: Wrap in a transaction
    // Trigger notification for application status updates (handles all statuses)
    try {
      // Fetch application details for email templates
      const applicationDetails =
        await this.getApplicationDetails(updatedApplication);

      await this.applicationNotificationService.dispatchSendInAppNotification(
        updatedApplication,
      );

      await this.applicationNotificationService.sendApplicationStatusEmail(
        updatedApplication,
        applicationDetails,
      );
    } catch (error) {
      console.error('Error sending status update notification:', error);
      // Don't fail the status update if notification fails
    }

    return updatedApplication;
  }

  // TODO: Limit the deletion to only the draft applications and don't need to send notification for deletion
  async remove(applicationId: Types.ObjectId): Promise<{ deleted: boolean }> {
    const application = await this.applicationModel
      .findById(applicationId)
      .exec();

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found`,
      );
    }

    // Check if the application is draft
    if (application.status !== ApplicationStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot delete application after submission.`,
      );
    }
    await this.applicationModel.findByIdAndDelete(applicationId).exec();

    return { deleted: true };
  }

  async getApplicationStatistics(): Promise<any> {
    const stats = await this.applicationModel
      .aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    const totalApplications = await this.applicationModel.countDocuments();

    const result = {
      total: totalApplications,
      byStatus: {},
    };

    stats.forEach((stat) => {
      result.byStatus[stat._id] = stat.count;
    });

    return result;
  }

  async createApplicationDraft(
    user: AuthenticatedRequest['user'],
    createApplicationDto: CreateApplicationDto,
  ): Promise<ApplicationDocument> {
    try {
      // Validate and auto-detect related entities from admission_program_id
      const admissionProgram = await this.admissionProgramModel
        .findById<AdmissionProgramDocument>(createApplicationDto.admission_program_id)
        // populate admission — include status and receiving_applications for cascade validation
        .populate<{ admission: null | Pick<WithObjectId<AdmissionDocument>, '_id' | 'status' | 'receiving_applications'> }>({ path: 'admission', select: '_id status receiving_applications' })
        .populate<{
          program: null | Pick<WithObjectId<ProgramDocument>, '_id' | 'campus_id' | 'academic_departments'> & {
            campus_id: null | Pick<WithObjectId<CampusDocument>, '_id'>;
            academic_departments: null | Pick<WithObjectId<AcademicDepartmentDocument>, '_id'>;
          }
        }>({
          path: 'program', select: '_id campus_id academic_departments',
          populate: [
            { path: 'campus_id', select: '_id' },
            { path: 'academic_departments', select: '_id', }
          ]
        })
        .lean();


      // Validate each population of the admission program
      {
        if (!admissionProgram) {
          throw new NotFoundException(
            `Admission Program with ID ${admissionProgram._id} not found`,
          );
        }

        // Validate admission is populated
        if (!admissionProgram.admission) {
          throw new BadRequestException(
            `Admission Program => Admission ID ${admissionProgram.admission._id} does not have a valid populated admission reference`,
          );
        }

        // Validate program is populated
        if (!admissionProgram.program) {
          throw new BadRequestException(
            `Admission Program => Program ID ${admissionProgram.program._id} does not have a valid populated program reference`,
          );
        }


        // Validate campus_id is populated (should be an object, not ObjectId)
        if (!admissionProgram.program.campus_id) {
          throw new BadRequestException(
            `Admission Program => Program => Campus ID ${admissionProgram.program.campus_id._id} does not have a valid populated campus_id reference`,
          );
        }


        // Validate academic_departments is populated
        if (!admissionProgram.program.academic_departments) {
          throw new BadRequestException(
            `Admission Program => Program => Academic Departments ${admissionProgram.program.academic_departments._id} does not have a valid populated academic_departments reference or is empty`,
          );
        }
      }


      // Guard: reject if the effective publication status resolves to hidden.
      // program='draft' → hidden; program='inherit' (or missing) → follow parent session.
      {
        const programStatus = admissionProgram.status;
        const sessionStatus = admissionProgram.admission?.status
        const effectivelyPublished =
          programStatus === AdmissionProgramCmsStatusEnum.Draft
            ? false
            : sessionStatus === AdmissionCmsStatusEnum.Published;

        if (!effectivelyPublished) {
          throw new BadRequestException('This admission program is not currently published');
        }
      }

      // Guard: reject if the effective receiving_applications resolves to false.
      // program='false' → reject; program='true' → accept;
      // program='inherit' (or missing) → follow parent session (missing session value = permissive).
      {
        const childRA = admissionProgram.receiving_applications;
        const parentRA = admissionProgram.admission?.receiving_applications;
        const sessionRa =
          parentRA === undefined || parentRA === null
            ? undefined
            : parentRA === false
              ? false
              : parentRA === true
                ? true
                : undefined;
        const effectivelyAccepting =
          childRA === AdmissionProgramReceivingApplicationsEnum.False
            ? false
            : childRA === AdmissionProgramReceivingApplicationsEnum.True
              ? true
              : sessionRa !== false;

        if (!effectivelyAccepting) {
          throw new BadRequestException('Not receiving applications for this program');
        }
      }


      const expectedDepartmentId = admissionProgram.program.academic_departments._id.toString();


      // Validate preferences admission_program_ids and ensure they all belong to the same department
      for (const [index, preference] of createApplicationDto.preferences.entries()) {

        // Skip 1st iteration as it is the top-level admission program
        if (index === 0) {
          continue;
        }

        const admissionProgramId = preference.admission_program_id;

        // Validate that the admission program exists
        const prefAdmissionProgram = await this.admissionProgramModel
          .findById(admissionProgramId)
          .populate<{
            program: null | Pick<WithObjectId<ProgramDocument>, '_id' | 'academic_departments'> & {
              academic_departments: null | Pick<WithObjectId<AcademicDepartmentDocument>, '_id'>[];
            }
          }>({
            path: 'program', select: '_id academic_departments',
            populate:
              { path: 'academic_departments', select: '_id', }
          })
          .lean();

        const currentPrefAdmissionProgramDepartmentId = prefAdmissionProgram?.program?.academic_departments?._id.toString();

        if (currentPrefAdmissionProgramDepartmentId !== expectedDepartmentId) {
          throw new BadRequestException(
            `All preferences must belong to the same department. Preference with Admission Program ID ${admissionProgramId} belongs to department ${currentPrefAdmissionProgramDepartmentId}, but expected department is ${expectedDepartmentId}`,
          );
        }
      }

      // Check if user has already applied for this admission program
      const existingApplication = await this.applicationModel
        .exists({
          // REVIEW: Application must require the first name and last name, but user doesn't store that
          applicant: stringToObjectId(user.sub),
          admission_program_id: admissionProgram._id,
        })
        .exec();

      if (existingApplication) {
        throw new BadRequestException(
          'Your application for this program has already been submitted.',
        );
      }

      // Create the application without snapshot (snapshot will be created on submission)
      const application = new this.applicationModel<BetterOmit<ApplicationDocument, '_id'>>({
        // ...createApplicationDto,
        total_processing_fee: createApplicationDto.total_processing_fee,
        applicant: stringToObjectId(user._id), // Ensure ObjectId
        admission_program_id: admissionProgram._id,
        program_id: admissionProgram.program._id, // Auto-populated from admission program
        program: admissionProgram.program._id, // Auto-populated from admission program
        campus_id: admissionProgram.program.campus_id._id, // Auto-populated from program

        admission_id: admissionProgram.admission._id, // Auto-populated from admission program

        departments: [
          {
            department: expectedDepartmentId, // Auto-populated from top-level admission_program_id
            preferences: createApplicationDto.preferences.map((pref) => ({
              program: pref.admission_program_id, // Schema expects 'program' field to reference AdmissionProgram
              preference_order: pref.preference_order,
            })),
          },
        ], // Use transformed departments with program field

        submission_date: new Date(),
        status: ApplicationStatus.DRAFT,
      });

      const savedApplication = await application.save();

      return savedApplication;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error('Error creating application:', error);
      throw new BadRequestException(
        error.message || 'Error processing application',
      );
    }
  }

  // Make generic to get the analytics for all users as well as for a specific user
  async getApplicationsAnalytics(user: AuthenticatedRequest['user']) {
    // Ensure we match by a proper ObjectId for applicant
    const applicantObjectId = new Types.ObjectId(user._id);

    // Get total count of applications
    const totalApplications = await this.applicationModel.countDocuments({
      applicant: applicantObjectId,
    });

    // Get breakdown by status using aggregation
    const statusBreakdown = await this.applicationModel.aggregate([
      {
        $match: {
          applicant: applicantObjectId,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Create breakdown object with all possible statuses
    const breakdown = {
      [ApplicationStatus.DRAFT]: 0,
      [ApplicationStatus.PENDING]: 0,
      [ApplicationStatus.APPROVED]: 0,
      [ApplicationStatus.REJECTED]: 0,
      [ApplicationStatus.UNDER_REVIEW]: 0,
    };

    // Fill in the actual counts
    statusBreakdown.forEach((item) => {
      if (item._id && breakdown.hasOwnProperty(item._id)) {
        breakdown[item._id] = item.count;
      }
    });

    return {
      totalApplications,
      breakdown,
    };
  }
}