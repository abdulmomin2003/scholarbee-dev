import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, SortOrder } from 'mongoose';
import {
    FeeStructure,
    FeeStructureDocument,
    FeeType,
    IFeeItem,
    PaymentType,
    SemesterApplicability,
} from '../schemas/fee-structure.schema';
import { CreateFeeDto } from '../dto/create-fee-structure.dto';
import { UpdateFeeDto } from '../dto/update-fee-structure.dto';
import { QueryFeeDto } from '../dto/query-fee-structure.dto';
import { calculateAllSemesterFees } from '../utils/fee-calculations.util';

@Injectable()
export class FeesService {
    constructor(
        @InjectModel(FeeStructure.name) private feeModel: Model<FeeStructureDocument>
    ) { }

    async create(createFeeDto: CreateFeeDto): Promise<FeeStructureDocument> {
        try {
            const createdFee = new this.feeModel({
                ...createFeeDto,
                created_at: new Date(),
            });

            return await createdFee.save();
        } catch (error) {
            if (error.name === 'ValidationError') {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }

    async findAll(queryDto: QueryFeeDto): Promise<{ data: FeeStructureDocument[], meta: any }> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            program_id,
            minTuitionFee,
            maxTuitionFee,
            minApplicationFee,
            maxApplicationFee,
            payment_schedule,
            createdAtFrom,
            createdAtTo,
            search,
            _migration_status,
            _needs_review,
        } = queryDto;

        const skip = (page - 1) * limit;
        const sortOptions: Record<string, SortOrder> = { [sortBy]: sortOrder as SortOrder };

        // Build filter
        const filter: any = {};

        if (program_id) {
            filter.program_id = program_id;
        }

        if (minTuitionFee !== undefined || maxTuitionFee !== undefined) {
            filter.tuition_fee = {};
            if (minTuitionFee !== undefined) {
                filter.tuition_fee.$gte = minTuitionFee;
            }
            if (maxTuitionFee !== undefined) {
                filter.tuition_fee.$lte = maxTuitionFee;
            }
        }

        if (minApplicationFee !== undefined || maxApplicationFee !== undefined) {
            filter.application_fee = {};
            if (minApplicationFee !== undefined) {
                filter.application_fee.$gte = minApplicationFee;
            }
            if (maxApplicationFee !== undefined) {
                filter.application_fee.$lte = maxApplicationFee;
            }
        }

        if (payment_schedule) {
            filter.payment_schedule = { $regex: payment_schedule, $options: 'i' };
        }

        if (_migration_status) {
            filter._migration_status = _migration_status;
        }

        if (typeof _needs_review === 'boolean') {
            filter._needs_review = _needs_review;
        }

        if (createdAtFrom || createdAtTo) {
            filter.created_at = {};
            if (createdAtFrom) {
                filter.created_at.$gte = createdAtFrom;
            }
            if (createdAtTo) {
                filter.created_at.$lte = createdAtTo;
            }
        }

        if (search) {
            filter.$or = [
                { payment_schedule: { $regex: search, $options: 'i' } },
                { other_fees: { $regex: search, $options: 'i' } },
                { program_id: { $regex: search, $options: 'i' } }
            ];
        }

        try {
            const [data, total] = await Promise.all([
                this.feeModel
                    .find(filter)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit)
                    .exec(),
                this.feeModel.countDocuments(filter)
            ]);

            // Normalize all fee structures to include computed semester fees
            const normalizedData = data.map((fee) => normalizeFeeStructure(fee));

            return {
                data: normalizedData,
                meta: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            throw new BadRequestException(`Error fetching fees: ${error.message}`);
        }
    }

    async findOne(id: string): Promise<any> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid fee ID');
        }

        const fee = await this.feeModel.findById(id).exec();

        if (!fee) {
            throw new NotFoundException(`Fee with ID ${id} not found`);
        }

        // Normalize fee structure to include computed semester fees
        return normalizeFeeStructure(fee);
    }

    async findByProgramId(programId: string): Promise<FeeStructureDocument[]> {
        return this.feeModel.find({ program_id: programId }).exec();
    }

    async update(id: string, updateFeeDto: UpdateFeeDto): Promise<FeeStructureDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid fee ID');
        }

        const updatedFee = await this.feeModel.findByIdAndUpdate(
            id,
            { $set: updateFeeDto },
            { new: true }
        ).exec();

        if (!updatedFee) {
            throw new NotFoundException(`Fee with ID ${id} not found`);
        }

        return updatedFee;
    }

    async remove(id: string): Promise<{ deleted: boolean }> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid fee ID');
        }

        const fee = await this.feeModel.findById(id).exec();

        if (!fee) {
            throw new NotFoundException(`Fee with ID ${id} not found`);
        }

        await this.feeModel.findByIdAndDelete(id).exec();

        return { deleted: true };
    }

    async getStatistics(): Promise<any> {
        const stats = await Promise.all([
            this.feeModel.countDocuments(),
            this.feeModel.aggregate([
                {
                    $group: {
                        _id: null,
                        avgTuitionFee: { $avg: '$tuition_fee' },
                        minTuitionFee: { $min: '$tuition_fee' },
                        maxTuitionFee: { $max: '$tuition_fee' },
                        avgApplicationFee: { $avg: '$application_fee' },
                        minApplicationFee: { $min: '$application_fee' },
                        maxApplicationFee: { $max: '$application_fee' }
                    }
                }
            ]),
            this.feeModel.aggregate([
                {
                    $group: {
                        _id: '$payment_schedule',
                        count: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        _id: { $ne: null }
                    }
                }
            ])
        ]);

        return {
            total: stats[0],
            feeStats: stats[1][0] || {
                avgTuitionFee: 0,
                minTuitionFee: 0,
                maxTuitionFee: 0,
                avgApplicationFee: 0,
                minApplicationFee: 0,
                maxApplicationFee: 0
            },
            byPaymentSchedule: stats[2].reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {})
        };
    }
}

/**
 * Helper to normalize a fee structure document into the new unified format.
 * If the document already has `fees` defined, it is returned as-is.
 * Otherwise, a new `fees` array is derived from legacy fields
 * (`tuition_fee`, `application_fee`, `other_fees`).
 *
 * This function also calculates and adds computed semester fees:
 * - first_semester_fee: Total fees for the first semester
 * - regular_semester_fee: Total fees for regular semesters (not first, not last)
 * - last_semester_fee: Total fees for the last semester
 *
 * IMPORTANT: This function replaces the `tuition_fee` field with `first_semester_fee`
 * to ensure API responses always return the calculated first semester fee in the
 * tuition_fee field, rather than the raw tuition_fee value from the database.
 *
 * NOTE: This function does not modify the database document, it only returns
 * a plain object representation that callers can use for responses.
 */
export function normalizeFeeStructure(doc: FeeStructureDocument | null): any {
    if (!doc) return null;

    const plain = doc.toObject ? doc.toObject() : (doc as any);

    // If fees already exist and are non-empty, use them; otherwise derive from legacy fields
    let fees: IFeeItem[] = [];

    if (Array.isArray(plain.fees) && plain.fees.length > 0) {
        fees = plain.fees;
    } else {
        // Derive tuition fee
        if (typeof plain.tuition_fee === 'number') {
            fees.push({
                type: FeeType.TUITION,
                amount: plain.tuition_fee,
                payment_type: PaymentType.RECURRING,
                semester_applicability: SemesterApplicability.ALL_SEMESTERS,
                residency_applicability: 'both',
                enrollment_applicability: 'both',
                is_mandatory: true,
            });
        }

        // Derive application fee
        if (typeof plain.application_fee === 'number') {
            fees.push({
                type: FeeType.APPLICATION,
                amount: plain.application_fee,
                payment_type: PaymentType.ONE_TIME,
                semester_applicability: SemesterApplicability.NOT_SEMESTER_SPECIFIC,
                residency_applicability: 'both',
                enrollment_applicability: 'both',
                is_mandatory: false,
            });
        }

        // Derive other fees
        if (Array.isArray(plain.other_fees)) {
            for (const item of plain.other_fees) {
                if (!item) continue;
                const amount = typeof item.fee_amount === 'number' ? item.fee_amount : undefined;
                if (amount === undefined) continue;

                fees.push({
                    type: FeeType.OTHER,
                    name: item.fee_name,
                    amount,
                    payment_type: PaymentType.RECURRING,
                    semester_applicability: item.include_in_first_semester
                        ? SemesterApplicability.FIRST_SEMESTER_ONLY
                        : SemesterApplicability.ALL_SEMESTERS,
                    residency_applicability: 'both',
                    enrollment_applicability: 'both',
                    is_mandatory: true,
                });
            }
        }
    }

    // Calculate computed semester fees
    const totalSemesters = plain.total_semesters || 8;
    const computedFees = calculateAllSemesterFees(fees, totalSemesters);

    // Build normalized fee structure
    const normalized = {
        ...plain,
        fees,
        // Add computed semester fees as primary fields
        first_semester_fee: computedFees.first,
        regular_semester_fee: computedFees.regular,
        last_semester_fee: computedFees.last,
    };

    // Replace tuition_fee with first_semester_fee for API responses
    // This ensures tuition_fee always contains the calculated first semester fee
    if (typeof normalized.first_semester_fee === 'number') {
        normalized.tuition_fee = normalized.first_semester_fee;
    }

    return normalized;
}