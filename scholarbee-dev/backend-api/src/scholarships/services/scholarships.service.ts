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
  Types
} from 'mongoose';
import {
  StudentScholarship,
  StudentScholarshipDocument,
} from 'src/student-scholarships/schemas/student-scholarship.schema';
import { stringToObjectId, verifyStringObjectId } from 'src/utils/db.utils';
import { CreateScholarshipDto } from '../dto/create-scholarship.dto';
import {
  QueryScholarshipDto,
  ScholarshipDeadlineStatusEnum,
} from '../dto/query-scholarship.dto';
import {
  Scholarship,
  ScholarshipDocument,
} from '../schemas/scholarship.schema';

@Injectable()
export class ScholarshipsService {
  constructor(
    @InjectModel(Scholarship.name)
    private scholarshipModel: Model<ScholarshipDocument>,
    @InjectModel(StudentScholarship.name)
    private studentScholarshipModel: Model<StudentScholarshipDocument>,
  ) { }

  async create(
    createScholarshipDto: CreateScholarshipDto,
    userId: string,
  ): Promise<ScholarshipDocument> {
    try {
      const scholarship = new this.scholarshipModel({
        ...createScholarshipDto,
        createdBy: userId,
      });
      return (await scholarship.save()).toObject();
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * findAllV2 — Unified scholarship listing with interleaved grouping.
   *
   * Instead of splitting into two methods (grouped vs ungrouped), this uses
   * MongoDB's $setWindowFields to assign a per-partition row number
   * (partitioned by university_id).
   *
   * Sorting order:
   *   1. group_rank  (ascending) — ensures diversity: one from each university first
   *   2. deadline_status_sort (ascending) — open (0) before expired (1)
   *   3. user's sortBy/sortOrder
   *
   * Because no documents are dropped, total count = matched count.
   * Pagination is straightforward and consistent.
   *
   * @param queryDto - Query parameters identical to findAll
   * @returns Scholarships with pagination metadata
   */
  async findAll(
    queryDto: QueryScholarshipDto,
  ): Promise<{ data: ScholarshipDocument[]; meta: any }> {
    const {
      search,
      scholarship_name,
      scholarship_type,
      university_id,
      country,
      region,
      deadline_status,
      deadline_from,
      deadline_to,
      amountMin,
      amountMax,
      favouriteBy,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
      populate = true,
      degree_level,
      location,
      status,
      campus_id,
      major,
      rating,
    } = queryDto;

    const now = new Date();
    const andConditions: FilterQuery<ScholarshipDocument>[] = [];

    // ── Filters (identical to findAll) ──────────────────────────────────

    // Search filter
    if (search) {
      andConditions.push({
        $or: [
          { scholarship_name: { $regex: search, $options: 'i' } },
          { scholarship_description: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (scholarship_name) {
      andConditions.push({
        scholarship_name: { $regex: scholarship_name, $options: 'i' },
      });
    }
    if (scholarship_type) {
      andConditions.push({ scholarship_type });
    }
    if (university_id) {
      andConditions.push({ university_id: new Types.ObjectId(university_id) });
    }
    if (country) {
      andConditions.push({ country: new Types.ObjectId(country) });
    }
    if (region) {
      andConditions.push({ region: new Types.ObjectId(region) });
    }

    // Status filter
    if (status) {
      andConditions.push({ status });
    }

    // Always filter by application_opening_date <= now
    andConditions.push({
      $or: [
        { application_opening_date: { $lte: now } },
        { application_opening_date: { $exists: false } },
        { application_opening_date: null },
      ],
    });

    if (amountMin !== undefined || amountMax !== undefined) {
      const amountCond: FilterQuery<ScholarshipDocument> = {};
      if (amountMin !== undefined)
        amountCond.amount = { ...amountCond.amount, $gte: amountMin };
      if (amountMax !== undefined)
        amountCond.amount = { ...amountCond.amount, $lte: amountMax };
      andConditions.push(amountCond);
    }
    if (favouriteBy && favouriteBy.length > 0) {
      andConditions.push({
        favouriteBy: {
          $in: favouriteBy.map((id) => new Types.ObjectId(id)),
        },
      });
    }
    if (degree_level) {
      andConditions.push({ degree_level });
    }
    if (location) {
      andConditions.push({ location });
    }
    if (campus_id) {
      andConditions.push({
        campus_ids: { $in: [new Types.ObjectId(campus_id)] },
      });
    }
    if (major) {
      andConditions.push({ major: { $regex: major, $options: 'i' } });
    }
    if (rating) {
      andConditions.push({ rating: { $gte: rating } });
    }

    // Application Deadline filter
    if (deadline_from || deadline_to) {
      const deadlineCond: FilterQuery<ScholarshipDocument> = {};
      if (deadline_from)
        deadlineCond.application_deadline = {
          ...deadlineCond.application_deadline,
          $gte: deadline_from,
        };
      if (deadline_to)
        deadlineCond.application_deadline = {
          ...deadlineCond.application_deadline,
          $lte: deadline_to,
        };
      andConditions.push(deadlineCond);
    } else if (deadline_status) {
      if (deadline_status === ScholarshipDeadlineStatusEnum.Active) {
        andConditions.push({
          $or: [
            { application_deadline: { $gte: now } },
            { application_deadline: { $exists: false } },
            { application_deadline: null },
          ],
        });
      } else if (deadline_status === ScholarshipDeadlineStatusEnum.Expired) {
        andConditions.push({ application_deadline: { $lt: now } });
      }
    }

    const skip = (page - 1) * limit;

    const filter: FilterQuery<ScholarshipDocument> =
      andConditions.length > 1
        ? { $and: andConditions }
        : andConditions[0] || {};

    // ── Pipeline ────────────────────────────────────────────────────────

    const pipeline: PipelineStage[] = [];

    // Stage 1: Match
    pipeline.push({ $match: filter });

    // Stage 2: Add computed deadline_status_sort (0 = open, 1 = expired)
    pipeline.push({
      $addFields: {
        deadline_status_sort: {
          $cond: {
            if: {
              $and: [
                { $ne: ['$application_deadline', null] },
                { $ne: [{ $type: '$application_deadline' }, 'missing'] },
                { $lt: ['$application_deadline', now] },
              ],
            },
            then: 1, // Expired
            else: 0, // Open
          },
        },
      },
    });

    // Stage 3: Sort within each partition before ranking
    // (deadline_status first, then user sort — so rank 0 always picks the best one per group)
    const innerSort: Record<string, 1 | -1> = {
      deadline_status_sort: 1,
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };
    pipeline.push({ $sort: innerSort });

    // Stage 4: $setWindowFields — assign a row number per university partition
    // Documents are already pre-sorted (Stage 3) by deadline_status + user sort.
    // We use a single-key sortBy (_id) since $documentNumber requires exactly one
    // sort key. The _id preserves the pre-established document order deterministically.
    pipeline.push({
      $setWindowFields: {
        partitionBy: { $ifNull: ['$university_id', null] },
        sortBy: { deadline_status_sort: 1 as const },
        output: {
          group_rank: {
            $documentNumber: {},
          },
        },
      },
    });

    // Stage 5: Convert $documentNumber (1-based) to 0-based index
    pipeline.push({
      $addFields: {
        group_rank: { $subtract: ['$group_rank', 1] },
      },
    });

    // Stage 6: Final sort — interleave by group_rank, then deadline, then user sort
    const finalSort: Record<string, 1 | -1> = {
      group_rank: 1,
      deadline_status_sort: 1,
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };
    pipeline.push({ $sort: finalSort });

    // ── Count (single pipeline, no data loss) ───────────────────────────
    const countPipeline = [
      { $match: filter },
      { $count: 'total' },
    ];
    const countResult = await this.scholarshipModel.aggregate(countPipeline).exec();
    const total = countResult[0]?.total || 0;

    // Stage 7: Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Stage 8: Remove computed fields
    pipeline.push({
      $project: {
        deadline_status_sort: 0,
        group_rank: 0,
      },
    });

    // Stage 9: Populate referenced fields if needed
    if (populate) {
      // Populate university_id
      pipeline.push({
        $lookup: {
          from: 'universities',
          localField: 'university_id',
          foreignField: '_id',
          as: 'university_id',
        },
      });
      pipeline.push({
        $unwind: {
          path: '$university_id',
          preserveNullAndEmptyArrays: true,
        },
      });

      // Populate region
      pipeline.push({
        $lookup: {
          from: 'regions',
          localField: 'region',
          foreignField: '_id',
          as: 'region',
        },
      });
      pipeline.push({
        $unwind: {
          path: '$region',
          preserveNullAndEmptyArrays: true,
        },
      });

      // Populate organization_id
      pipeline.push({
        $lookup: {
          from: 'organizations',
          localField: 'organization_id',
          foreignField: '_id',
          as: 'organization_id',
        },
      });
      pipeline.push({
        $unwind: {
          path: '$organization_id',
          preserveNullAndEmptyArrays: true,
        },
      });
    }

    // Execute
    const scholarships = await this.scholarshipModel.aggregate(pipeline).exec();

    const totalPages = Math.ceil(total / limit);

    return {
      data: scholarships as ScholarshipDocument[],
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(
    scholarshipId: string,
    userId?: string,
  ): Promise<ScholarshipDocument & { is_already_applied?: boolean }> {
    if (!Types.ObjectId.isValid(scholarshipId)) {
      throw new BadRequestException('Invalid scholarship ID');
    }

    const scholarship_id_object_id = new Types.ObjectId(scholarshipId);
    const pipeline: PipelineStage[] = [];

    // Stage 1: Match the specific scholarship by ID
    pipeline.push({
      $match: {
        _id: scholarship_id_object_id,
      },
    });

    // Stage 2: Population - Lookup university details
    pipeline.push({
      $lookup: {
        from: 'universities', // collection name for universities
        let: { universityId: '$university_id' }, // pass the university_id as a variable
        pipeline: [
          {
            $match: {
              $expr: {
                // Convert string university_id to ObjectId for comparison
                $eq: ['$_id', { $toObjectId: '$$universityId' }],
              },
            },
          },
        ],
        as: 'university_id',
      },
    });

    // Unwind the populated `university_id` field (since it should be a single document)
    pipeline.push({
      $unwind: {
        path: '$university_id',
        preserveNullAndEmptyArrays: true,
      },
    });

    // Stage 3: Population - Lookup region details
    pipeline.push({
      $lookup: {
        from: 'regions', // collection name for regions
        let: { regionId: '$region' }, // pass the region as a variable
        pipeline: [
          {
            $match: {
              $expr: {
                // Convert string region to ObjectId for comparison
                $eq: ['$_id', { $toObjectId: '$$regionId' }],
              },
            },
          },
        ],
        as: 'region',
      },
    });

    // Unwind the populated `region` field (since it should be a single document)
    pipeline.push({
      $unwind: {
        path: '$region',
        preserveNullAndEmptyArrays: true,
      },
    });

    // Stage 4: Check for existing student scholarship applications (if userId is provided)
    if (userId && Types.ObjectId.isValid(userId)) {
      const userObjectId = new Types.ObjectId(userId);

      // Lookup student scholarship applications to check if user has already applied
      pipeline.push({
        $lookup: {
          // define the collection to lookup
          from: 'student_scholarships', // collection name for student scholarships
          // define the variables to use in the pipeline
          let: {
            scholarshipId: '$_id', // the scholarship ID from the current document
            userId: userObjectId, // the user ID passed to the function
          },
          // define the pipeline to use in the lookup
          pipeline: [
            {
              // match the fields from the lookup collection with the variables defined above
              $match: {
                $expr: {
                  // use $and to combine multiple conditions
                  $and: [
                    {
                      // match student_id (handle both string and ObjectId types)
                      $or: [
                        { $eq: ['$student_id', '$$userId'] }, // if stored as ObjectId
                        { $eq: ['$student_id', { $toString: '$$userId' }] }, // if stored as string
                      ],
                    },
                    {
                      // match scholarship_id (handle both string and ObjectId types)
                      $or: [
                        { $eq: ['$scholarship_id', '$$scholarshipId'] }, // if stored as ObjectId
                        {
                          $eq: [
                            '$scholarship_id',
                            { $toString: '$$scholarshipId' },
                          ],
                        }, // if stored as string
                      ],
                    },
                  ],
                },
              },
            },
            // limit the result to 1 (since we only need to know if one exists)
            { $limit: 1 },
          ],
          // define the name of the field to store the result of the lookup
          as: 'student_applications',
        },
      });


      // Stage 5: Add computed field for is_already_applied
      pipeline.push({
        $addFields: {
          // check if the user has already applied for this scholarship
          is_already_applied: {
            // If $student_applications is missing, default to [], then check size
            $gt: [{ $size: { $ifNull: ['$student_applications', []] } }, 0],
          },
        },
      });

    }


    // Stage 6: Remove the temporary lookup array
    pipeline.push({
      $project: {
        student_applications: 0, // exclude the temporary field from the final result
      },
    });

    // Execute the aggregation pipeline
    const result = await this.scholarshipModel.aggregate(pipeline).exec();

    // Check if the scholarship was found
    if (!result || result.length === 0) {
      throw new NotFoundException(
        `Scholarship with ID ${scholarshipId} not found`,
      );
    }

    // Return the first (and only) result
    return result[0] as ScholarshipDocument & { is_already_applied?: boolean };
  }

  async update(
    id: string,
    updateScholarshipDto: Partial<CreateScholarshipDto>,
  ): Promise<ScholarshipDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid scholarship ID');
    }

    const scholarship = await this.scholarshipModel
      .findByIdAndUpdate(id, updateScholarshipDto, { new: true })
      .populate('university_id')
      // .populate('country')
      .populate('region')
      .exec();

    if (!scholarship) {
      throw new NotFoundException(`Scholarship with ID ${id} not found`);
    }

    return scholarship;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid scholarship ID');
    }

    const result = await this.scholarshipModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Scholarship with ID ${id} not found`);
    }

    return { deleted: true };
  }

  /**
   * Add a scholarship to the user's favorites
   * Flow:
   * - Check if the scholarship exists
   * @param scholarshipId - The ID of the scholarship
   * @param userId - The ID of the user
   * @returns The updated scholarship
   */
  async addToFavorites(
    scholarshipId: string,
    userId: string,
  ): Promise<ScholarshipDocument> {
    if (!verifyStringObjectId(scholarshipId)) {
      throw new BadRequestException('Invalid scholarship ID');
    }

    if (!verifyStringObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const userIdObject = stringToObjectId(userId);

    // Additional safety: Check if scholarship exists first
    const existingScholarship =
      await this.scholarshipModel.findById(scholarshipId);
    if (!existingScholarship) {
      throw new NotFoundException(
        `Scholarship with ID ${scholarshipId} not found`,
      );
    }

    // Safe to use runValidators: false because:
    // 1. favouriteBy has no custom validators
    // 2. We're only updating this field with $addToSet
    // 3. ObjectId validation is done above
    // 4. MongoDB ensures type safety
    const scholarship = await this.scholarshipModel.findByIdAndUpdate(
      scholarshipId,
      { $addToSet: { favouriteBy: userIdObject } },
      { new: true, runValidators: false },
    );

    return scholarship!; // We know it exists from check above
  }

  async removeFromFavorites(
    id: string,
    userId: string,
  ): Promise<ScholarshipDocument> {
    if (!verifyStringObjectId(id)) {
      throw new BadRequestException('Invalid scholarship ID');
    }

    if (!verifyStringObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const userIdObject = stringToObjectId(userId);

    // Safe to use runValidators: false because:
    // 1. favouriteBy has no custom validators
    // 2. We're only updating this field with $pull
    // 3. ObjectId validation is done above
    // 4. MongoDB ensures type safety
    const scholarship = await this.scholarshipModel.findByIdAndUpdate(
      id,
      { $pull: { favouriteBy: userIdObject } },
      { new: true, runValidators: false },
    );

    if (!scholarship) {
      throw new NotFoundException(`Scholarship with ID ${id} not found`);
    }

    return scholarship;
  }

  async findFavorites(
    userId: string,
    queryDto: QueryScholarshipDto,
  ): Promise<{ data: ScholarshipDocument[]; meta: any }> {
    return this.findAll({
      ...queryDto,
      favouriteBy: [userId],
    });
  }

  /**
   * Get total count of scholarships in the database
   * 
   * @returns Total count of scholarships
   */
  async getTotalCount(): Promise<{ total_scholarships_count: number }> {
    const now = new Date();
    const filter = {
      $or: [
        { application_opening_date: { $lte: now } },
        { application_opening_date: { $exists: false } },
        { application_opening_date: null },
      ],
    };
    const total = await this.scholarshipModel.countDocuments(filter).exec();
    return { total_scholarships_count: total };
  }
}
