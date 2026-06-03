import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, RootFilterQuery, Types } from 'mongoose';
import { AddressesService } from 'src/addresses/addresses.service';
import { AddressDocument } from 'src/addresses/schemas/address.schema';
import { UsersService } from 'src/users/users.service';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { getDataAndCountAggPipeline, getSortOrder } from 'src/utils/db.utils';
import { toSlug } from 'src/utils/slug.utils';
import {
  Admission,
  AdmissionDocument,
  AdmissionStatusEnum,
} from '../admissions/schemas/admission.schema';
import { Campus, CampusDocument } from '../campuses/schemas/campus.schema';
import { Program, ProgramDocument } from '../programs/schemas/program.schema';
import { CreateUniversityDto } from './dto/create-university.dto';
import { QueryUniversityDto } from './dto/query-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
import { University, UniversityDocument } from './schemas/university.schema';
import { UniversityDetailListQueryDto } from './dto/university-detail-list-query.dto';
import { escapeRegex } from 'src/utils/db.utils';

@Injectable()
export class UniversitiesService {
  constructor(
    @InjectModel(University.name)
    private universityModel: Model<UniversityDocument>,
    @InjectModel(Campus.name)
    private campusModel: Model<CampusDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly usersService: UsersService,
  ) { }

  private buildAdmissionStatusAggStages(
    admission_program_status: AdmissionStatusEnum,
  ): PipelineStage[] {
    const associatedAdmissionsLookupStage = {
      $lookup: {
        from: 'admissions', // The name of the admissions collection
        localField: '_id', // Field from the universities collection
        foreignField: 'university_id', // Field from the admissions collection
        as: '__associated_admissions', // Output array field
      },
    };

    if (admission_program_status === AdmissionStatusEnum.UNAVAILABLE) {
      return [
        associatedAdmissionsLookupStage,
        {
          $match: {
            __associated_admissions: { $size: 0 }, // Filter out universities that have no admissions
          },
        },
      ];
    } else if (admission_program_status === AdmissionStatusEnum.AVAILABLE) {
      return [
        associatedAdmissionsLookupStage,
        {
          $match: {
            __associated_admissions: { $not: { $size: 0 } }, // Filter for universities that have at least one admission
          },
        },
      ];
    }
    return []; // Should not happen if called correctly, or handle default
  }

  /**
   * Generate slug for a university
   * Format: {universityName}
   * Example: "nust", "lums"
   * @param name - University name
   * @returns Generated slug
   */
  private generateSlug(name: string): string {
    return toSlug(name);
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
    while (await this.universityModel.exists({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    return uniqueSlug;
  }

  private getAddressPopulationAggStages(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'addresses',
          let: { addressObjectId: { $toObjectId: '$address_id' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$addressObjectId'],
                },
              },
            },
          ],
          as: 'address_id',
        },
      },
      {
        $unwind: {
          path: '$address_id',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  /**
   * Create a new university with auto-generated slug if not provided
   * @param createUniversityDto - University creation data
   * @param userId - ID of user creating the university
   * @returns Created university document
   */
  async create(createUniversityDto: CreateUniversityDto, userId: string) {
    // Generate slug if not provided
    const slug = await this.getUniqueSlug(this.generateSlug(createUniversityDto.name))

    const newUniversity = new this.universityModel({
      ...createUniversityDto,
      slug,
      createdBy: Types.ObjectId.createFromHexString(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await newUniversity.save();
  }

  async findAll(
    queryDto: QueryUniversityDto,
    overrideFilter: RootFilterQuery<UniversityDocument> = {},
  ) {
    const {
      page,
      limit = 10,
      sortOrder,
      sortBy,
      name: nameSearch,
      search,
      admission_program_status,
    } = queryDto;
    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy ?? 'createdAt']: getSortOrder(sortOrder ?? 'desc') } as const;

    const filterPipeline: PipelineStage[] = [];

    // Conditionally add admission status stages
    if (admission_program_status) {
      filterPipeline.push(
        ...this.buildAdmissionStatusAggStages(admission_program_status),
      );
    }

    // Add name search filter if present
    if (nameSearch) {
      filterPipeline.push({
        $match: { name: { $regex: nameSearch, $options: 'i' } },
      });
    }

    // Add name/abbreviation search filter if present
    if (search) {
      filterPipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { abbreviation: { $regex: search, $options: 'i' } },
          ],
        },
      });
    }
    // Add any other overrideFilter conditions
    const remainingOverrideFilter = { ...overrideFilter } as any;
    if (remainingOverrideFilter.name) delete remainingOverrideFilter.name;
    if (Object.keys(remainingOverrideFilter).length > 0) {
      filterPipeline.push({ $match: remainingOverrideFilter });
    }

    // Always add address population stages
    filterPipeline.push(...this.getAddressPopulationAggStages());

    // Remove temp fields
    filterPipeline.push({ $project: { __associated_admissions: 0 } });

    // Data and count pipelines
    // TODO: Append the method to all model schemas such that we can use it like this:
    // universityModel.dataAndCountAggregate(filterPipeline, sort, limit, skip);
    const { dataPipeline, countPipeline } = getDataAndCountAggPipeline(
      filterPipeline,
      sort,
      limit,
      skip,
    );

    const [data, countDocArr] = await Promise.all([
      this.universityModel.aggregate(dataPipeline).exec(),
      this.universityModel.aggregate(countPipeline).exec(),
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

  async findAllWithAvailablePrograms(queryDto: QueryUniversityDto) {
    queryDto.admission_program_status = AdmissionStatusEnum.AVAILABLE;

    // Finally, get the universities with pagination
    const result = await this.findAll(queryDto, {
      // Exclude any universities marked as test entities
      is_test_entity: { $ne: true },
    });

    return result;
  }

  async findById(
    universityId: Types.ObjectId,
    populateFields: (keyof UniversityDocument)[] = []
  ) {
    // Validate ID if a string was provided
    if (typeof universityId === 'string' && !Types.ObjectId.isValid(universityId)) {
      throw new BadRequestException('Invalid university ID');
    }

    const universityQuery = this.universityModel.findById(universityId);

    if (populateFields.includes('address_id')) {
      universityQuery.populate<{ address_id: AddressDocument }>('address_id');
    }

    const university = await universityQuery.exec();
    if (!university) {
      const idString = typeof universityId === 'string' ? universityId : universityId.toString();
      throw new NotFoundException(`University with ID ${idString} not found`);
    }

    return university;
  }

  /**
   * Find a university by its SEO-friendly slug
   * @param slug - The university slug
   * @param populateFields - Fields to populate (e.g., ['address_id'])
   * @returns The university document or null if not found
   */
  async findBySlug(
    slug: string,
    populateFields: (keyof UniversityDocument)[] = []
  ): Promise<UniversityDocument | null> {
    const query = this.universityModel.findOne({ slug });

    // Apply population if needed
    for (const field of populateFields) {
      query.populate(field);
    }

    const university = await query.exec();
    return university;
  }

  /**
   * Get university profile details by filter parameters
   * @param queryDto - Query parameters containing slug and city
   * @param populateFields - Fields to populate (defaults to ['address_id'])
   * @returns Array of university documents matching the filters
   */
  async getDetailList(
    queryDto: UniversityDetailListQueryDto,
  ): Promise<any[]> {
    const { slug, city, selectedCampusId } = queryDto;

    const matchFilter: any = {};
    if (slug) {
      matchFilter.slug = { $regex: new RegExp(`^${escapeRegex(slug)}$`, 'i') };
    }

    const profile = await this.buildProfileResponse({ universityMatchFilter: matchFilter, selectedCampusId, city });

    // If no university matched the slug, OR a city was specified but yielded no matching campuses
    if (!profile || (city && profile.metadata.total_campuses === 0)) {
      return [];
    }

    return [profile];
  }

  async update(universityId: string | Types.ObjectId, updateUniversityDto: UpdateUniversityDto) {
    const updateData: any = { ...updateUniversityDto };

    // Convert string IDs to ObjectIds if they exist
    if (updateData.address_id) {
      updateData.address_id = Types.ObjectId.createFromHexString(
        updateData.address_id,
      );
    }

    return await this.universityModel.findByIdAndUpdate(
      universityId,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true },
    );
  }

  async remove(id: string) {
    return await this.universityModel.findByIdAndDelete(id);
  }

  // 1. Existing ID-based method
  async getUniversityProfile(universityId: string, selectedCampusId?: string) {
    if (!Types.ObjectId.isValid(universityId)) {
      throw new BadRequestException('Invalid university ID');
    }

    const matchFilter = { _id: new Types.ObjectId(universityId) };
    const profile = await this.buildProfileResponse({ universityMatchFilter: matchFilter, selectedCampusId });

    if (!profile) {
      throw new NotFoundException(`University with ID ${universityId} not found`);
    }

    return profile;
  }

  // 2. New Slug-based method
  async getUniversityProfileBySlug(slug: string, selectedCampusId?: string) {
    if (!slug) {
      throw new BadRequestException('University slug is required');
    }

    const matchFilter = { slug };
    const profile = await this.buildProfileResponse({ universityMatchFilter: matchFilter, selectedCampusId });

    if (!profile) {
      throw new NotFoundException(`University with slug ${slug} not found`);
    }

    return profile;
  }

  /**
   * CORE LOGIC: Reusable helper to aggregate campuses and format the profile response.
   * Now internally handles fetching the base university document via a dynamic match filter.
   */
  private async buildProfileResponse({
    universityMatchFilter,
    selectedCampusId,
    city,
  }: {
    universityMatchFilter: any;
    selectedCampusId?: string;
    city?: string;
  }
  ) {
    // 1. Fetch the base university using the provided dynamic filter
    const university = await this.universityModel.findOne(universityMatchFilter).exec();

    // Return null if no university matches the base filter (e.g., wrong slug, ID, or name)
    if (!university) {
      return null;
    }

    // 2. Aggregate campuses using the retrieved University's ObjectId
    const campusesPipeline: PipelineStage[] = [
      {
        $match: {
          university_id: university._id,
        },
      },
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
    ];

    // Push the city filter directly into the DB aggregation pipeline if provided
    if (city) {
      campusesPipeline.push({
        $match: {
          'address.city': { $regex: new RegExp(`^${escapeRegex(city)}$`, 'i') }
        }
      });
    }

    // Add final projection
    campusesPipeline.push({
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
        is_primary: 1,
        level: 1,
        address: 1,
      },
    });

    const campuses = await this.campusModel.aggregate(campusesPipeline).exec();

    // Handle No Campuses Case
    if (campuses.length === 0) {
      return {
        metadata: {
          university_name: university.name || null,
          university_logo: university.logo_url || null,
          city: null,
          state: null,
          country: null,
          established_date: null,
          accreditation: university.accreditations || null,
          ranking: university.ranking || null,
          total_campuses: 0,
        },
        overview: {
          description: university.description || null,
        },
        selectedCampus: null,
        otherCampuses: [],
      };
    }

    // Determine selected campus
    let selectedCampus;
    if (selectedCampusId) {
      if (!Types.ObjectId.isValid(selectedCampusId)) {
        throw new BadRequestException('Invalid selected campus ID');
      }
      selectedCampus = campuses.find(
        (c) => c._id.toString() === selectedCampusId,
      );
      if (!selectedCampus) {
        throw new BadRequestException(
          'Selected campus does not belong to this university',
        );
      }
    } else {
      // Find primary campus, or fallback to lowest level, then first by name
      const primaryCampus = campuses.find((c) => c.is_primary === true);
      if (primaryCampus) {
        selectedCampus = primaryCampus;
      } else {
        selectedCampus = campuses.sort((a, b) => {
          if (a.level !== b.level) return a.level - b.level;
          return a.name.localeCompare(b.name);
        })[0];
      }
    }

    // Build Response Objects
    const metadata = {
      university_name: university.name || null,
      university_logo: university.logo_url || null,
      city: selectedCampus?.address?.city || null,
      state: selectedCampus?.address?.state || null,
      country: selectedCampus?.address?.country || null,
      established_date: selectedCampus?.established_date || null,
      accreditation: university.accreditations || null,
      ranking: university.ranking || null,
      total_campuses: campuses.length,
    };

    const overview = {
      description: university.description || null,
    };

    const selectedCampusData = selectedCampus
      ? {
        id: selectedCampus._id.toString(),
        name: selectedCampus.name,
        faculty: selectedCampus.faculty_count || null,
        area: selectedCampus.campus_area || null,
        housing_available: selectedCampus.residential_facilities || false,
        website: selectedCampus.website || null,
        address: selectedCampus.address || null,
        pictures: selectedCampus.pictures || [],
        primary_picture: selectedCampus.logo_url || null,
        scholarbee_verified: Boolean(selectedCampus.scholarbee_verified),
      }
      : null;

    const otherCampuses = campuses
      .filter((c) => c._id.toString() !== selectedCampus?._id.toString())
      .sort((a, b) => {
        if (a.is_primary !== b.is_primary) {
          return b.is_primary - a.is_primary;
        }
        return a.name.localeCompare(b.name);
      })
      .map((campus) => ({
        id: campus._id.toString(),
        name: campus.name,
        faculty: campus.faculty_count || null,
        area: campus.campus_area || null,
        housing_available: campus.residential_facilities || false,
        website: campus.website || null,
        address: campus.address || null,
        primary_picture: campus.logo_url || null,
        scholarbee_verified: Boolean(campus.scholarbee_verified),
      }));

    return {
      metadata,
      overview,
      selectedCampus: selectedCampusData,
      otherCampuses,
    };
  }

  /**
   * Get the university for the authenticated user
   * Only campus admins can access this endpoint
   * @param userId - The user ID
   * @param populateFields - Fields to populate (e.g., ['address_id'])
   * @returns The university document
   * @throws ForbiddenException if user is not a campus admin
   */
  async getMyUniversity(
    userId: string,
    populateFields: (keyof UniversityDocument)[] = ['address_id'],
  ): Promise<UniversityDocument> {
    // getUserCampusInfo validates that user is a campus admin and has a university
    const { universityId } = await this.usersService.getUserCampusInfo(userId);

    // Convert to ObjectId if needed
    return this.findById(universityId, populateFields);
  }


}