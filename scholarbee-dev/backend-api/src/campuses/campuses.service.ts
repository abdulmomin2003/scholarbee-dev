import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  PipelineStage,
  RootFilterQuery,
  Types
} from 'mongoose';
import { IConfiguration } from 'src/config/configuration';
import { UsersService } from 'src/users/users.service';
import { AdmissionStatusEnum } from '../admissions/schemas/admission.schema';
import { User, UserDocument, UserNS } from '../users/schemas/user.schema';
import { getDataAndCountAggPipeline, getSortOrder, stringToObjectId } from '../utils/db.utils';
import { Application, ApplicationDocument, ApplicationStatus } from '../applications/schemas/application.schema';
import { Program, ProgramDocument } from '../programs/schemas/program.schema';
import { DegreeLevelEnum } from '../common/constants/shared.constants';
import { CreateCampusDto } from './dto/create-campus.dto';
import { QueryCampusDto } from './dto/query-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { ApplicantsByProgramResponseDto } from './dto/applicants-by-program-response.dto';
import { Campus, CampusDocument, CampusEntityTypeEnum } from './schemas/campus.schema';
import { escapeRegex } from '../utils/db.utils';
import { toSlug } from '../utils/slug.utils';
import { University, UniversityDocument } from '../universities/schemas/university.schema';
import { Address, AddressDocument } from '../addresses/schemas/address.schema';
import { getTemplateLookupStages, getTemplateLookupCleanupStage } from 'src/utils/program-template-lookup.utils';

@Injectable()
export class CampusesService {
  constructor(
    @InjectModel(Campus.name)
    private campusModel: Model<CampusDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    @InjectModel(Program.name)
    private programModel: Model<ProgramDocument>,
    @InjectModel(University.name)
    private universityModel: Model<UniversityDocument>,
    @InjectModel(Address.name)
    private addressModel: Model<AddressDocument>,
    private usersService: UsersService,
    private configService: ConfigService<IConfiguration>,
  ) { }

  /**
   * * Only Campus Admins or Primary Campus Admins can access this campus
   * Helper method to check if user is authorized to modify a campus
   * Throws ForbiddenException if not authorized
   */
  async checkCampusAccessAuth(
    userId: string,
    campusId: Types.ObjectId,
    userCampusId?: Types.ObjectId,
  ): Promise<void> {
    const isCampusAdmin = !!userCampusId;

    if (isCampusAdmin) {
      if (!userCampusId.equals(campusId)) {
        const { campus: adminCampus, universityId } = await this.usersService.getUserCampusInfo(userId);
        const isPrimaryCampusAdmin = adminCampus.is_primary;

        const targetCampus = await this.findById(campusId);
        if (!targetCampus) {
          throw new ForbiddenException('Campus not found or not accessible');
        }

        const sameUniversity = targetCampus.university_id.equals(universityId);
        const isDirectCampusAdmin = targetCampus._id.equals(adminCampus._id);

        if (!(sameUniversity && (isPrimaryCampusAdmin || isDirectCampusAdmin))) {
          throw new ForbiddenException('You are not authorized to access this campus');
        }
      }
    }
  }

  private buildAdmissionStatusAggStages(
    admission_program_status: AdmissionStatusEnum,
  ): PipelineStage[] {
    const associatedAdmissionsLookupStage = {
      $lookup: {
        from: 'admissions', // The name of the admissions collection
        let: { campusId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$campus_id', '$$campusId'],
              },
            },
          },
        ],
        as: '__associated_admissions', // Output array field
      },
    };

    if (admission_program_status === AdmissionStatusEnum.UNAVAILABLE) {
      return [
        associatedAdmissionsLookupStage,
        {
          $match: {
            __associated_admissions: { $size: 0 }, // Filter out campuses that have no admissions
          },
        },
      ];
    } else if (admission_program_status === AdmissionStatusEnum.AVAILABLE) {
      return [
        associatedAdmissionsLookupStage,
        {
          $match: {
            __associated_admissions: { $not: { $size: 0 } }, // Filter for campuses that have at least one admission
          },
        },
      ];
    }
    return []; // Should not happen if called correctly, or handle default
  }

  private getAddressPopulationAggStages(
    addressKey: string = 'address_id',
  ): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'addresses',
          let: { addressObjectId: '$address_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$addressObjectId'],
                },
              },
            },
          ],
          as: addressKey,
        },
      },
      {
        $unwind: {
          path: `$${addressKey}`,
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  private getUniversityPopulationAggStages(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'universities',
          let: { universityObjectId: '$university_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$universityObjectId'],
                },
              },
            },
          ],
          as: 'university_id',
        },
      },
      {
        $unwind: {
          path: '$university_id',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  async findAll(
    queryDto: QueryCampusDto,
    overrideFilter: RootFilterQuery<CampusDocument> = {},
    userId?: string,
  ) {
    const {
      page,
      limit = 10,
      sortOrder,
      sortBy,
      name: nameSearch,
      admission_program_status,
      campus_type,
      university_type,
      partner_university,
      favouriteBy,
      city,
      state,
      country,
      area,
    } = queryDto;
    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy ?? 'createdAt']: getSortOrder(sortOrder) } as const;

    const filterPipeline: PipelineStage[] = [];

    // Conditionally add admission status stages
    if (admission_program_status) {
      filterPipeline.push(
        ...this.buildAdmissionStatusAggStages(admission_program_status),
      );
    }

    // nameSearch is applied AFTER the university lookup so that university_id.name
    // and university_id.abbreviation are already available on each document.

    // Add favouriteBy filter if present
    if (favouriteBy && favouriteBy.length > 0) {
      // only return documents where the favouriteBy array contains all of those IDs (order doesn't matter). ($all is used to match all elements in the array. $in is used to match any of the elements in the array.)
      filterPipeline.push({
        $match: { favouriteBy: { $all: favouriteBy } },
      });
    }
    // Note: this filteer is deperciated and will be removed once frontend will used the filter based on university_type below
    // Add campus_type filter if present
    // This filter is applied early in the pipeline to reduce the number of documents processed
    // Note: SUPPORT campuses are always excluded later, so this filter won't conflict.
    // Accepts an array — uses $in so multiple types can be matched in one query.
    if (campus_type && campus_type.length > 0) {
      filterPipeline.push({
        $match: { campus_type: { $in: campus_type } },
      });
    }

    // Add partner_university filter if present
    // When true, only campuses where is_partner === true are returned.
    if (partner_university === true) {
      filterPipeline.push({
        $match: { is_partner: true },
      });
    }

    // Add any other overrideFilter conditions
    const remainingOverrideFilter = { ...overrideFilter } as any;
    if (remainingOverrideFilter.name) delete remainingOverrideFilter.name;
    if (Object.keys(remainingOverrideFilter).length > 0) {
      filterPipeline.push({ $match: remainingOverrideFilter });
    }

    // Add address lookup early if city/area filtering is needed
    const needsAddressLookup = !!(city || area);
    if (needsAddressLookup) {
      filterPipeline.push(...this.getAddressPopulationAggStages('address'));
    }

    // Apply city filter if present
    const cityTrimmed = typeof city === 'string' ? city.trim() : city;
    if (cityTrimmed) {
      filterPipeline.push({
        $match: {
          'address.city': { $regex: escapeRegex(cityTrimmed), $options: 'i' },
        },
      });
    }

    // Apply state filter if present
    if (state) {
      filterPipeline.push({
        $match: { 'address.state': { $regex: escapeRegex(state.trim()), $options: 'i' } },
      });
    }

    // Apply country filter if present
    if (country) {
      filterPipeline.push({
        $match: { 'address.country': { $regex: escapeRegex(country.trim()), $options: 'i' } },
      });
    }

    // Apply area filter if present (searches across multiple address fields)
    if (area) {
      const areaTrimmed = area.trim();
      filterPipeline.push({
        $match: {
          $or: [
            { 'address.city': { $regex: escapeRegex(areaTrimmed), $options: 'i' } },
            { 'address.state': { $regex: escapeRegex(areaTrimmed), $options: 'i' } },
            { 'address.country': { $regex: escapeRegex(areaTrimmed), $options: 'i' } },
            { 'address.address_line_1': { $regex: escapeRegex(areaTrimmed), $options: 'i' } },
          ],
        },
      });
    }

    // Always add address and university population stages (if not already added)
    if (!needsAddressLookup) {
      filterPipeline.push(...this.getAddressPopulationAggStages());
    }
    filterPipeline.push(...this.getUniversityPopulationAggStages());

    // Apply nameSearch AFTER the university lookup so we can match across:
    //   1. campus name              → campus.name
    //   2. university name          → university_id.name
    //   3. university abbreviation  → university_id.abbreviation
    if (nameSearch) {
      const nameRegex = { $regex: nameSearch, $options: 'i' };
      filterPipeline.push({
        $match: {
          $or: [
            { name: nameRegex },
            { 'university_id.name': nameRegex },
            { 'university_id.abbreviation': nameRegex },
          ],
        },
      });
    }

    // Filter by university type AFTER university lookup so university_id.type is available.
    if (university_type && university_type.length > 0) {
      filterPipeline.push({
        $match: { 'university_id.type': { $in: university_type } },
      });
    }

    // Add favorite status for authenticated users
    if (userId) {
      const userIdObjectId = new Types.ObjectId(userId);
      filterPipeline.push({
        $addFields: {
          isFavorite: {
            $cond: {
              if: { $isArray: '$favouriteBy' },
              then: { $in: [userIdObjectId, '$favouriteBy'] },
              else: false,
            },
          },
        },
      });
    }

    // Always exclude test and support campuses from public listings.
    // entity_type defaults to PUBLIC; null/missing values are also treated as PUBLIC.
    filterPipeline.push({
      $match: {
        entity_type: { $nin: [CampusEntityTypeEnum.TEST, CampusEntityTypeEnum.SUPPORT] },
      },
    });

    // Remove temp fields
    filterPipeline.push({ $project: { __associated_admissions: 0 } });

    // Data and count pipelines
    const { dataPipeline, countPipeline } = getDataAndCountAggPipeline(
      filterPipeline,
      sort,
      limit,
      skip,
    );

    const [data, countDocArr] = await Promise.all([
      this.campusModel.aggregate(dataPipeline).exec(),
      this.campusModel.aggregate(countPipeline).exec(),
    ]);
    const total = Number(countDocArr.at(0)?.total);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private async generateSlug(campusName: string, universityId: Types.ObjectId, addressId: Types.ObjectId): Promise<string> {
    const university = await this.universityModel.findById(universityId).exec();
    const address = await this.addressModel.findById(addressId).exec();
    if (!university || !address) throw new NotFoundException('University or address not found');

    const base = `${university.name}-${campusName}-${address.city}`;
    return toSlug(base);
  }

  private async getUniqueSlug(slug: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;
    while (await this.campusModel.exists({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    return uniqueSlug;
  }

  async create(createCampusDto: CreateCampusDto, userId: string) {
    const slug = await this.generateSlug(createCampusDto.name, createCampusDto.university_id, createCampusDto.address_id).then((slug) => {
      return this.getUniqueSlug(slug);
    });


    const newCampus = new this.campusModel({
      ...createCampusDto,
      slug,
      university_id: createCampusDto.university_id,
      address_id: createCampusDto.address_id,
      createdBy: Types.ObjectId.createFromHexString(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await newCampus.save();
  }

  async findById(
    id: Types.ObjectId,
    populateFields: (keyof CampusDocument)[] = ['university_id', 'address_id'],
  ) {
    let query = this.campusModel.findById(id);

    if (Number(populateFields.length) > 0) {
      for (const field of populateFields) {
        query = query.populate(field); // Chain the populate calls
      }
    }

    const response = await query.exec();
    return response;
  }

  async findBySlug(
    slug: string,
    populateFields: (keyof CampusDocument)[] = ['university_id', 'address_id'],
  ) {
    let query = this.campusModel.findOne({ slug });

    if (Number(populateFields.length) > 0) {
      for (const field of populateFields) {
        query = query.populate(field);
      }
    }

    const response = await query.exec();
    return response;
  }

  async getCampusPictures(id: string): Promise<{ pictures: { url: string }[] }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid campus ID');
    }

    const campus = await this.campusModel
      .findById(id)
      .select('pictures')
      .exec();

    if (!campus) {
      throw new NotFoundException(`Campus with ID ${id} not found`);
    }

    return { pictures: campus.pictures || [] };
  }

  async addPicture(id: string, pictureUrl: string): Promise<CampusDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid campus ID');
    }

    const campus = await this.campusModel.findById(id);
    if (!campus) {
      throw new NotFoundException(`Campus with ID ${id} not found`);
    }

    // Check if picture already exists
    const existingPictures = campus.pictures || [];
    const pictureExists = existingPictures.some(p => p.url === pictureUrl);

    if (pictureExists) {
      throw new BadRequestException('Picture with this URL already exists');
    }

    // Add new picture to the array
    existingPictures.push({ url: pictureUrl });

    campus.pictures = existingPictures;

    return await campus.save();
  }

  async removePicture(id: string, pictureUrl?: string, index?: number): Promise<CampusDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid campus ID');
    }

    if (!pictureUrl && index === undefined) {
      throw new BadRequestException('Either picture URL or index must be provided');
    }

    const campus = await this.campusModel.findById(id);
    if (!campus) {
      throw new NotFoundException(`Campus with ID ${id} not found`);
    }

    const existingPictures = campus.pictures || [];

    if (existingPictures.length === 0) {
      throw new BadRequestException('Campus has no pictures to remove');
    }

    let updatedPictures: { url: string }[];

    if (pictureUrl) {
      // Remove by URL
      updatedPictures = existingPictures.filter(p => p.url !== pictureUrl);
      if (updatedPictures.length === existingPictures.length) {
        throw new NotFoundException('Picture with this URL not found');
      }
    } else if (index !== undefined) {
      // Remove by index
      if (index < 0 || index >= existingPictures.length) {
        throw new BadRequestException(`Invalid picture index. Must be between 0 and ${existingPictures.length - 1}`);
      }
      updatedPictures = existingPictures.filter((_, i) => i !== index);
    } else {
      throw new BadRequestException('Either picture URL or index must be provided');
    }

    campus.pictures = updatedPictures;

    return await campus.save();
  }

  async findByUniversity(universityId: string) {
    const filterPipeline: PipelineStage[] = [];

    // Add the university_id filter
    filterPipeline.push({
      $match: {
        $expr: { $eq: ['$university_id', { $toObjectId: universityId }] },
      },
    });

    // populate the address field with the `address` object and keep the `address_id` field
    filterPipeline.push(...this.getAddressPopulationAggStages('address'));

    const data = await this.campusModel.aggregate(filterPipeline).exec();

    return data;
  }

  async update(id: string, updateCampusDto: UpdateCampusDto) {
    // Create a copy of the DTO to avoid modifying the original
    const updateData: any = { ...updateCampusDto };

    // Convert string IDs to ObjectIds if they exist
    if (updateData.university_id) {
      updateData.university_id = Types.ObjectId.createFromHexString(
        updateData.university_id,
      );
    }

    if (updateData.address_id) {
      updateData.address_id = Types.ObjectId.createFromHexString(
        updateData.address_id,
      );
    }

    return await this.campusModel.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true },
    );
  }

  async remove(id: string) {
    return await this.campusModel.findByIdAndDelete(id);
  }

  /**
   * Checks if a campus has any valid admins.
   * @param campusId - The campus ID as a string
   * @returns Promise<boolean> - true if at least one admin exists, false otherwise
   */
  async hasValidAdmins(campusId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(campusId)) {
      // throw error
      throw new BadRequestException('Invalid campus ID');
    }
    const count = await this.userModel.countDocuments({
      $expr: { $eq: ['$campus_id', { $toObjectId: campusId }] },
      user_type: UserNS.UserType.Campus_Admin,
    });
    return count > 0;
  }

  /**
   * Find or create a support campus for student support chat functionality.
   * The support campus is a special campus that doesn't represent any real university
   * but is used for support team to communicate with students.
   * @returns Promise<CampusDocument> - The support campus document
   */
  async findOrCreateSupportCampus(): Promise<CampusDocument> {
    const supportEmail = this.configService.get('support.email', {
      infer: true,
    });

    if (!supportEmail) {
      throw new BadRequestException('Support email not configured');
    }

    // First, try to find any existing support campus by entity_type and email
    let supportCampus = await this.campusModel.findOne({
      entity_type: CampusEntityTypeEnum.SUPPORT,
      contact_email: supportEmail,
    });

    if (!supportCampus) {
      // Fallback: find by email + name pattern (handles legacy docs created before entity_type)
      supportCampus = await this.campusModel.findOne({
        contact_email: supportEmail,
        $or: [
          { name: { $regex: /support/i } },
          { entity_type: CampusEntityTypeEnum.SUPPORT },
        ],
      });
    }

    if (!supportCampus) {
      try {
        // Create new support campus
        supportCampus = new this.campusModel({
          name: 'ScholarBee Support',
          contact_email: supportEmail,
          contact_phone: '+92 325 555 9699',
          website: 'https://scholarbee.com',
          logo_url: '/assets/svg/scholarbee-logo.svg', // Use ScholarBee logo
          entity_type: CampusEntityTypeEnum.SUPPORT,
          level: 7,
          library_facilities: false,
          sports_facilities: false,
          dining_options: false,
          transportation_options: false,
          residential_facilities: false,
          healthcare_facilities: false,
          parking_facilities: false,
          security_features: false,
          facilities: 'Online support and assistance',
          accreditations: 'ScholarBee Support Team',
          createdBy: new Types.ObjectId(), // System created
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        supportCampus = await supportCampus.save();
      } catch (error) {
        // Handle duplicate key error (E11000) - another process might have created it
        if (error.code === 11000) {
          // Try to find the support campus again
          supportCampus = await this.campusModel.findOne({
            entity_type: CampusEntityTypeEnum.SUPPORT,
            contact_email: supportEmail,
          });

          if (!supportCampus) {
            throw new BadRequestException('Failed to create support campus due to duplicate key constraint');
          }
        } else {
          throw error;
        }
      }
    }

    return supportCampus.toObject();
  }

  /**
   * Find support campus by email.
   * @param email - The support email address
   * @returns Promise<CampusDocument | null> - The support campus document or null if not found
   */
  async findSupportCampusByEmail(
    email: string,
  ): Promise<CampusDocument | null> {
    return this.campusModel.findOne({
      contact_email: email,
      // name: 'ScholarBee Support',
    });
  }

  /**
   * Get applicant statistics by program for a specific campus and optional degree level.
   * Returns the count of submitted applications (status != DRAFT) grouped by program.
   * @param campusId - The campus ID
   * @param degreeLevel - Optional degree level filter (Bachelors, Masters, Doctorate)
   * @param includeZeroApplicants - If true, includes programs with 0 applicants
   * @returns Promise<ApplicantsByProgramResponseDto> - Response with total count and program breakdown
   */
  async getApplicantsByProgram(
    campusId: Types.ObjectId,
    degreeLevel?: DegreeLevelEnum,
    includeZeroApplicants: boolean = false,
  ): Promise<ApplicantsByProgramResponseDto> {
    if (includeZeroApplicants) {
      // Start from programs collection to include all programs, even with 0 applicants
      const programMatch: any = { campus_id: campusId, deleted: { $ne: true } };

      const aggregationPipeline: PipelineStage[] = [
        // Start from programs collection
        {
          $match: programMatch,
        },
        // Lookup template and merge fields (name, degree_level, field_of_study, major, tags)
        ...getTemplateLookupStages(),
        getTemplateLookupCleanupStage(),
        // Filter by degree_level AFTER template lookup (degree_level now comes from template)
        ...(degreeLevel ? [{ $match: { degree_level: degreeLevel } } as PipelineStage] : []),
        // Lookup applications for each program
        {
          $lookup: {
            from: 'applications',
            let: { programId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$program', '$$programId'] },
                      { $eq: ['$campus_id', campusId] },
                      { $ne: ['$status', ApplicationStatus.DRAFT] },
                    ],
                  },
                },
              },
            ],
            as: 'applications',
          },
        },
        // Project program with applicant count
        {
          $project: {
            _id: 0,
            programId: { $toString: '$_id' },
            programName: '$name',
            applicantCount: { $size: '$applications' },
            degreeLevel: '$degree_level',
          },
        },
        {
          $sort: { applicantCount: -1 },
        },
      ];

      const programs = await this.programModel.aggregate(aggregationPipeline).exec();

      // Calculate totals
      const totalApplicantCount = programs.reduce((sum, p) => sum + p.applicantCount, 0);
      const totalProgramCount = programs.length;

      return {
        totalApplicantCount,
        totalProgramCount,
        programs,
        campusId: campusId.toString(),
        generatedAt: new Date(),
      };
    } else {
      // Original logic: start from applications (only programs with applicants)
      const aggregationPipeline: PipelineStage[] = [
        // Match applications for the campus that are not in DRAFT status (all submitted)
        {
          $match: {
            campus_id: campusId,
            status: { $ne: ApplicationStatus.DRAFT },
          },
        },
        // Lookup program details
        {
          $lookup: {
            from: 'programs',
            localField: 'program',
            foreignField: '_id',
            as: 'programData',
          },
        },
        // Unwind program data
        {
          $unwind: '$programData',
        },
      ];

      // Lookup template and merge fields onto programData
      aggregationPipeline.push(...getTemplateLookupStages('programData'));
      aggregationPipeline.push(getTemplateLookupCleanupStage());

      // Conditionally filter by degree level if provided
      if (degreeLevel) {
        aggregationPipeline.push({
          $match: {
            'programData.degree_level': degreeLevel,
          },
        });
      }

      // Use facet to get both program breakdown, total count, and program count
      aggregationPipeline.push({
        $facet: {
          programs: [
            {
              $group: {
                _id: '$program',
                programName: { $first: '$programData.name' },
                degreeLevel: { $first: '$programData.degree_level' },
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                programId: { $toString: '$_id' },
                programName: 1,
                applicantCount: '$count',
                degreeLevel: 1,
              },
            },
            {
              $sort: { applicantCount: -1 },
            },
          ],
          totalCount: [
            {
              $count: 'total',
            },
          ],
          programCount: [
            {
              $group: {
                _id: '$program',
              },
            },
            {
              $count: 'total',
            },
          ],
        },
      });

      // Project final response
      aggregationPipeline.push({
        $project: {
          programs: '$programs',
          totalApplicantCount: {
            $ifNull: [{ $arrayElemAt: ['$totalCount.total', 0] }, 0],
          },
          totalProgramCount: {
            $ifNull: [{ $arrayElemAt: ['$programCount.total', 0] }, 0],
          },
        },
      });

      const result = await this.applicationModel
        .aggregate(aggregationPipeline)
        .exec();

      if (!result || result.length === 0) {
        return {
          totalApplicantCount: 0,
          totalProgramCount: 0,
          programs: [],
          campusId: campusId.toString(),
          generatedAt: new Date(),
        };
      }

      const data = result[0];
      return {
        totalApplicantCount: data.totalApplicantCount || 0,
        totalProgramCount: data.totalProgramCount || 0,
        programs: data.programs || [],
        campusId: campusId.toString(),
        generatedAt: new Date(),
      };
    }
  }

  async addToFavorites(
    campusId: Types.ObjectId,
    userId: string,
  ): Promise<CampusDocument> {
    const userIdObjectId = new Types.ObjectId(userId);


    // Add to favorites (idempotent - $addToSet does nothing if already exists)
    const campus = await this.campusModel
      .findByIdAndUpdate(
        campusId,
        { $addToSet: { favouriteBy: userIdObjectId } }, // ensures no duplicates
        { new: true }, // return the updated doc
      )
      .orFail(
        new NotFoundException(
          `Campus with ID ${campusId.toString()} not found`,
        ),
      )

    return campus;
  }

  async removeFromFavorites(
    campusId: Types.ObjectId,
    userId: string,
  ): Promise<CampusDocument> {
    const userIdObjectId = new Types.ObjectId(userId);

    // Remove from favorites (idempotent - $pull does nothing if not in favorites)
    const campus = await this.campusModel
      .findByIdAndUpdate(
        campusId,
        { $pull: { favouriteBy: userIdObjectId } },
        { new: true }, // return updated doc
      )
      .orFail(
        new NotFoundException(
          `Campus with ID ${campusId.toString()} not found`,
        ),
      )

    return campus;
  }

  async findFavorites(
    userId: string,
    queryDto: QueryCampusDto,
  ): Promise<{ data: CampusDocument[]; meta: any }> {
    // Add the user ID to the favorites filter
    queryDto.favouriteBy = [stringToObjectId(userId)];
    const foundCampuses = await this.findAll(queryDto, {}, userId);

    return foundCampuses;
  }

  /**
   * Get total count of campuses in the database
   * Excludes test entities (is_test_entity = true) and support campuses from the count
   * 
   * @returns Total count of non-test and non-support campuses
   */
  async getTotalCount(): Promise<{ total_campuses_count: number }> {
    const filter: RootFilterQuery<CampusDocument> = {
      entity_type: { $nin: [CampusEntityTypeEnum.TEST, CampusEntityTypeEnum.SUPPORT] },
    };
    const total = await this.campusModel.countDocuments(filter).exec();
    return { total_campuses_count: total };
  }


  async getCampusDetail(campusSlug: string, city?: string): Promise<any> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          slug: { $regex: new RegExp(`^${escapeRegex(campusSlug)}$`, 'i') },
          entity_type: { $ne: CampusEntityTypeEnum.TEST },
        },
      },
      {
        $lookup: {
          from: 'addresses',
          let: { addressObjectId: { $toObjectId: '$address_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$addressObjectId'] } } },
          ],
          as: 'address',
        },
      },
      { $unwind: { path: '$address', preserveNullAndEmptyArrays: true } },
    ];

    if (city) {
      pipeline.push({
        $match: {
          'address.city': { $regex: new RegExp(`^${escapeRegex(city)}$`, 'i') },
        },
      });
    }

    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        campus_area: 1,
        residential_facilities: 1,
        website: 1,
        established_date: 1,
        faculty_count: 1,
        pictures: 1,
        logo_url: 1,
        scholarbee_verified: 1,
        university_id: 1,
        address: 1,
      },
    });

    const campuses = await this.campusModel.aggregate(pipeline).exec();

    if (campuses.length === 0) {
      throw new NotFoundException(
        `Campus not found with slug "${campusSlug}"${city ? ` in city "${city}"` : ''}`,
      );
    }

    const campus = campuses[0];

    // Fetch university, total campus count, and other campuses (excluding current one)
    const [university, totalCampuses, otherCampusesDocs] = await Promise.all([
      this.universityModel.findById(campus.university_id).exec(),
      this.campusModel.countDocuments({
        university_id: campus.university_id,
        entity_type: { $ne: CampusEntityTypeEnum.TEST },
      }).exec(),
      // Fetch all other campuses of the same university (excluding current campus)
      this.campusModel.aggregate([
        {
          $match: {
            university_id: campus.university_id,
            _id: { $ne: campus._id }, // Exclude current campus
            entity_type: { $ne: CampusEntityTypeEnum.TEST },
          },
        },
        // Lookup addresses for other campuses
        {
          $lookup: {
            from: 'addresses',
            let: { addressObjectId: { $toObjectId: '$address_id' } },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$addressObjectId'] } } },
            ],
            as: 'address',
          },
        },
        { $unwind: { path: '$address', preserveNullAndEmptyArrays: true } },
        // Project required fields for otherCampuses response
        {
          $project: {
            _id: 1,
            name: 1,
            faculty_count: 1,
            slug: 1,
            campus_area: 1,
            residential_facilities: 1,
            website: 1,
            logo_url: 1,
            scholarbee_verified: 1,
            address: 1,
            pictures: 1,
          },
        },
      ]).exec(),
    ]);

    // Transform other campuses to match the required response format
    const otherCampuses = otherCampusesDocs.map((campusDoc: any) => ({
      id: campusDoc._id.toString(),
      name: campusDoc.name,
      faculty: campusDoc.faculty_count || null,
      slug: campusDoc.slug || null,
      area: campusDoc.campus_area || null,
      housing_available: campusDoc.residential_facilities || false,
      website: campusDoc.website || null,
      address: campusDoc.address || null,
      pictures: campusDoc.pictures || [],
      primary_picture: campusDoc.logo_url || null,
      scholarbee_verified: Boolean(campusDoc.scholarbee_verified),
    }));

    return {
      metadata: {
        university_name: university?.name || null,
        university_logo: university?.logo_url || null,
        city: campus.address?.city || null,
        state: campus.address?.state || null,
        country: campus.address?.country || null,
        established_date: campus.established_date || null,
        accreditation: university?.accreditations || null,
        ranking: university?.ranking || null,
        total_campuses: totalCampuses,
      },
      overview: {
        description: university?.description || null,
      },
      selectedCampus: {
        id: campus._id.toString(),
        name: campus.name,
        faculty: campus.faculty_count || null,
        area: campus.campus_area || null,
        housing_available: campus.residential_facilities || false,
        website: campus.website || null,
        address: campus.address || null,
        pictures: campus.pictures || [],
        primary_picture: campus.logo_url || null,
        scholarbee_verified: Boolean(campus.scholarbee_verified),
      },
      otherCampuses: otherCampuses,
    };
  }

  /**
 * Find all partner campuses grouped by university.
 * Returns primary campuses that are marked as partners, grouped by their universities.
 * @returns Promise with data array containing university groups with their partner campuses
 */
  async findAllPartners(): Promise<{
    data: Array<{
      university: {
        _id: string;
        name: string;
        logo_url: string | null;
        website?: string;
        slug: string;
        city: string;
      };
      campuses: Array<{
        _id: string;
        name: string;
        logo_url: string | null;
        website?: string;
        slug: string;
        city: string;
      }>;
    }>;
  }> {
    const pipeline: PipelineStage[] = [
      // Match partner primary campuses that are not test entities
      {
        $match: {
          is_partner: true,
          is_test_entity: { $ne: true },
        },
      },
      // Lookup Campus Address to get city
      {
        $lookup: {
          from: 'addresses',
          let: { addressObjectId: { $toObjectId: '$address_id' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$addressObjectId'] },
              },
            },
            {
              $project: { city: 1 }, // Only bring the city to save memory
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
      // Lookup university information
      {
        $lookup: {
          from: 'universities',
          let: { universityId: '$university_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$universityId'],
                },
              },
            },
            // Nested Lookup for University Address to get city
            {
              $lookup: {
                from: 'addresses',
                let: { uniAddressObjectId: { $toObjectId: '$address_id' } },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$uniAddressObjectId'] },
                    },
                  },
                  {
                    $project: { city: 1 },
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
            {
              $project: {
                _id: 1,
                name: 1,
                logo_url: 1,
                website: 1,
                slug: 1,
                city: 1,
              },
            },
          ],
          as: 'university',
        },
      },
      {
        $unwind: {
          path: '$university',
          preserveNullAndEmptyArrays: false,
        },
      },
      // Sort campuses by is_primary (primary first) before grouping
      {
        $sort: {
          is_primary: -1, // -1 means descending, so true (primary) comes first
        },
      },
      // Group by university_id and collect campuses
      // Note: Campuses are already sorted by is_primary (primary first) from previous stage
      {
        $group: {
          _id: '$university_id',
          university: { $first: '$university' },
          campuses: {
            $push: {
              _id: { $toString: '$_id' },
              name: '$name',
              logo_url: '$logo_url',
              website: '$website',
              slug: '$slug',
              city: '$address.city', // Resolves from the campus address lookup
            },
          },
        },
      },
      // Project final structure
      {
        $project: {
          _id: 0,
          university: {
            _id: { $toString: '$university._id' },
            name: '$university.name',
            logo_url: '$university.logo_url',
            website: '$university.website',
            slug: '$university.slug',
            city: '$university.city',
          },
          campuses: 1,
        },
      },
      // Sort by university name
      {
        $sort: {
          'university.name': 1,
        },
      },
    ];

    const result = await this.campusModel.aggregate(pipeline).exec();

    return {
      data: result,
    };
  }

}
