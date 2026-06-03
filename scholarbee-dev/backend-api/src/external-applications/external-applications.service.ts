import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AuthenticatedRequest } from 'src/auth/types/auth.interface';
import { stringToObjectId } from 'src/utils/db.utils';
import { CreateExternalApplicationDto } from './dto/create-external-application.dto';
import { QueryExternalApplicationDto } from './dto/query-external-application.dto';
import {
  ExternalApplication,
  ExternalApplicationDocument,
} from './schemas/external-application.schema';
import {
  AdmissionProgram,
  AdmissionProgramDocument,
} from '../admission-programs/schemas/admission-program.schema';
import { UsersService } from 'src/users/users.service';
import { UserDocument } from 'src/users/schemas/user.schema';
import { getTimeRangeFilter } from 'src/elasticsearch/utils/time-range-filter.util';
import { getDataAndCountAggPipeline, getSortOrder } from 'src/utils/db.utils';
import { getTemplateLookupStages, getTemplateLookupCleanupStage, mergeProgramTemplateFields } from 'src/utils/program-template-lookup.utils';

interface FindAllOptions {
  page: number;
  limit: number;
  status?: string;
  campusId?: string;
  program?: string;
}

@Injectable()
export class ExternalApplicationsService {
  constructor(
    @InjectModel(ExternalApplication.name)
    private externalApplicationModel: Model<ExternalApplicationDocument>,
    @InjectModel(AdmissionProgram.name)
    private admissionProgramModel: Model<AdmissionProgramDocument>,
    @InjectConnection()
    private connection: Connection,
    private userService: UsersService,
  ) { }
  /**
   * TODO: Check if this method can be integrated with the user service/ user model to make it reusable
   * Creates an applicant snapshot from user data
   * @param user The user document to create snapshot from
   * @returns The applicant snapshot object
   */
  private createApplicantSnapshot(user: UserDocument) {
    const {
      first_name,
      last_name,
      full_name,
      email,
      phone_number,
      date_of_birth,
      father_name,
      father_profession,
      father_status,
      father_income,
      mother_name,
      mother_profession,
      mother_status,
      mother_income,
      religion,
      special_person,
      gender,
      nationality,
      provinceOfDomicile,
      districtOfDomicile,
      stateOrProvince,
      city,
      postalCode,
      streetAddress,
      profile_image_url,
      user_type,
      educational_backgrounds,
      national_id_card,
      student_id,
    } = user;

    return {
      first_name: first_name || null,
      last_name: last_name || null,
      full_name: full_name || null,
      email: email || null,
      phone_number: phone_number || null,
      date_of_birth: date_of_birth || null,
      father_name: father_name || null,
      father_profession: father_profession || null,
      father_status: father_status || null,
      father_income: father_income || null,
      mother_name: mother_name || null,
      mother_profession: mother_profession || null,
      mother_status: mother_status || null,
      mother_income: mother_income || null,
      religion: religion || null,
      special_person: special_person || null,
      gender: gender || null,
      nationality: nationality || null,
      provinceOfDomicile: provinceOfDomicile || null,
      districtOfDomicile: districtOfDomicile || null,
      stateOrProvince: stateOrProvince || null,
      city: city || null,
      postalCode: postalCode || null,
      streetAddress: streetAddress || null,
      profile_image_url: profile_image_url || null,
      user_type: user_type || null,
      educational_backgrounds:
        educational_backgrounds?.map((edu) => ({
          _id: edu._id,
          education_level: edu.education_level || null,
          field_of_study: edu.field_of_study || null,
          school_college_university: edu.school_college_university || null,
          marks_gpa: {
            total_marks_gpa: edu.marks_gpa?.total_marks_gpa || null,
            obtained_marks_gpa: edu.marks_gpa?.obtained_marks_gpa || null,
          },
          year_of_passing: edu.year_of_passing || null,
          board: edu.board || null,
          transcript: edu.transcript || null,
        })) || [],
      national_id_card: {
        front_side: national_id_card?.front_side || null,
        back_side: national_id_card?.back_side || null,
      },
      ...(student_id ? { student_id } : {}),
    };
  }

  async create(
    user: AuthenticatedRequest['user'],
    createExternalApplicationDto: CreateExternalApplicationDto,
  ) {
    const { program, admission, admission_program, campus, university } =
      createExternalApplicationDto;

    // TODO: Make a get request to the user service to get the user data
    const userData = await this.userService.findById(user._id);

    const applicant_snapshot = this.createApplicantSnapshot(userData);

    const applicationData: ExternalApplication = {
      applicant: stringToObjectId(user._id),
      applicant_snapshot,
      program,
      admission,
      admission_program,
      campus,
      university,
    };

    // Start a transaction session
    const session = await this.connection.startSession();

    try {
      // Start the transaction
      const savedApplication = await session.withTransaction(async () => {
        // Create the external application within the transaction
        const externalApplication = new this.externalApplicationModel(
          applicationData,
        );
        const savedApplication = await externalApplication.save({ session });

        // Add the student to the admission program's redirected_students array
        await this.admissionProgramModel.findByIdAndUpdate(
          admission_program,
          {
            $addToSet: { redirected_students: stringToObjectId(user._id) },
          },
          { new: true, session },
        );

        return savedApplication;
      });

      return savedApplication;
    } catch (error) {
      // Transaction will be automatically rolled back
      throw error;
    } finally {
      // End the session
      await session.endSession();
    }
  }

  async findAll(
    user: AuthenticatedRequest['user'],
    queryDto: QueryExternalApplicationDto,
  ) {
    const {
      page,
      limit = 10,
      sortBy,
      sortOrder,
      time_range,
      programId,
      universityId,
      campusId,
    } = queryDto;

    const skip = queryDto.skip;
    const sort = { [sortBy ?? 'createdAt']: getSortOrder(sortOrder ?? 'desc') } as const;

    // Build filter pipeline
    const filterPipeline: PipelineStage[] = [];

    // Add time range filter
    if (time_range) {
      const timeRangeFilter = getTimeRangeFilter(time_range, 'createdAt');
      if (timeRangeFilter) {
        filterPipeline.push({ $match: timeRangeFilter });
      }
    }

    // Add field filters with proper ObjectId conversion
    const fieldFilters: Record<string, Types.ObjectId> = {};
    if (programId) fieldFilters.program = new Types.ObjectId(programId);
    if (universityId)
      fieldFilters.university = new Types.ObjectId(universityId);
    if (campusId) fieldFilters.campus = new Types.ObjectId(campusId);

    if (Object.keys(fieldFilters).length > 0) {
      filterPipeline.push({ $match: fieldFilters });
    }

    // Add population stages
    filterPipeline.push(...this.getPopulationAggStages());

    // Data and count pipelines
    const { dataPipeline, countPipeline } = getDataAndCountAggPipeline(
      filterPipeline,
      sort,
      limit,
      skip,
    );

    // Get available filters pipeline
    const availableFiltersPipeline: PipelineStage[] = [
      ...filterPipeline,
      {
        $group: {
          _id: null,
          programs: {
            $addToSet: { id: '$program', name: '$program_doc.name' },
          },
          universities: {
            $addToSet: { id: '$university', name: '$university_doc.name' },
          },
          campuses: { $addToSet: { id: '$campus', name: '$campus_doc.name' } },
        },
      },
    ];

    const [data, countDocArr, availableFiltersDoc] = await Promise.all([
      this.externalApplicationModel.aggregate(dataPipeline).exec(),
      this.externalApplicationModel.aggregate(countPipeline).exec(),
      this.externalApplicationModel.aggregate(availableFiltersPipeline).exec(),
    ]);

    const total = Number(countDocArr.at(0)?.total);
    const availableFilters = availableFiltersDoc.at(0) || {
      programs: [],
      universities: [],
      campuses: [],
    };

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      availableFilters,
    };
  }

  private getPopulationAggStages(): PipelineStage[] {
    return [
      // Lookup campus - campus field in external_applications maps to _id in campuses
      {
        $lookup: {
          from: 'campuses',
          localField: 'campus',
          foreignField: '_id',
          as: 'campus_doc',
        },
      },
      { $unwind: { path: '$campus_doc', preserveNullAndEmptyArrays: true } },

      // Lookup university - university field in external_applications maps to _id in universities
      {
        $lookup: {
          from: 'universities',
          localField: 'university',
          foreignField: '_id',
          as: 'university_doc',
        },
      },
      {
        $unwind: { path: '$university_doc', preserveNullAndEmptyArrays: true },
      },

      // Lookup program - program field in external_applications maps to _id in programs
      {
        $lookup: {
          from: 'programs',
          localField: 'program',
          foreignField: '_id',
          as: 'program_doc',
        },
      },
      { $unwind: { path: '$program_doc', preserveNullAndEmptyArrays: true } },

      // Lookup template and merge fields onto program_doc (name, degree_level, field_of_study, major, tags)
      ...getTemplateLookupStages('program_doc'),
      getTemplateLookupCleanupStage(),

      // Project final structure
      {
        $project: {
          _id: 1,
          applicant: 1,
          applicant_snapshot: 1,
          program: 1,
          program_doc: 1,
          admission: 1,
          admission_program: 1,
          campus: 1,
          campus_doc: 1,
          university: 1,
          university_doc: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];
  }

  async findOne(id: string, userId: string) {
    const application = await this.externalApplicationModel
      .findOne<ExternalApplicationDocument>({
        _id: id,
        applicant: userId,
      })
      .populate({
        path: 'program',
        select: 'name code description template',
        populate: { path: 'template' },
      })
      .populate('admission', 'title year description')
      .exec();

    if (!application) {
      throw new NotFoundException('External application not found');
    }

    // Merge template fields onto populated program for the response
    if (application.program && typeof application.program === 'object') {
      mergeProgramTemplateFields(application.program as unknown as Record<string, unknown>);
    }

    return application;
  }

  async getAnalytics() {
    // Get total count of external applications
    const totalCount = await this.externalApplicationModel.countDocuments();

    // Get per university count using aggregation pipeline
    // Now using direct university reference from the schema
    const universityStats = await this.externalApplicationModel.aggregate([
      {
        $lookup: {
          from: 'universities', // Direct lookup to universities collection
          localField: 'university',
          foreignField: '_id',
          as: 'universityInfo',
        },
      },
      // the previous lookup makes the universityInfo field an array (assuming there are multiple universities), so we need to unwind it so that each `universityInfo` is an single object
      {
        $unwind: {
          path: '$universityInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$university',
          universityName: { $first: '$universityInfo.name' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 1,
          universityName: 1,
          count: 1,
        },
      },
    ]);

    return {
      perUniversityStats: universityStats,
      summary: {
        totalExternalApplications: totalCount,
        totalUniqueUniversities: universityStats.length,
        averageApplicationsPerUniversity:
          universityStats.length > 0
            ? Math.round((totalCount / universityStats.length) * 100) / 100
            : 0,
      },
    };
  }
}
