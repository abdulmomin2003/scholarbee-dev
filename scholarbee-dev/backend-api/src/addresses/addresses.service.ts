import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder, Types } from 'mongoose';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address, AddressDocument } from './schemas/address.schema';

@Injectable()
export class AddressesService {
    constructor(
        @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
    ) { }

    async getCities(trimValues: boolean = false): Promise<Array<{ label: string; value: string }>> {
        const cities = await this.addressModel.distinct('city').exec();

        const processed = (cities as string[])
            .filter((city) => typeof city === 'string' && city.length > 0)
            .map((city) => (trimValues ? city.trim() : city))
            .filter((city) => city.length > 0);

        const unique = Array.from(new Set(processed));

        // Return in format expected by frontend: { label: string, value: string }
        // value is lowercase for consistency with existing filter implementation
        return unique
            .sort((a, b) => a.localeCompare(b))
            .map((city) => ({
                label: city,
                value: city.toLowerCase().trim()
            }));
    }

    async create(createAddressDto: CreateAddressDto, userId: string) {
        const newAddress = new this.addressModel({
            ...createAddressDto,
            createdBy: Types.ObjectId.createFromHexString(userId),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return await newAddress.save();
    }

    async findAll(
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'createdAt',
        order: SortOrder = 'desc',
    ) {
        const skip = (page - 1) * limit;
        const sort = { [sortBy]: order };

        const [data, total] = await Promise.all([
            this.addressModel.find().sort(sort).skip(skip).limit(limit).exec(),
            this.addressModel.countDocuments(),
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
    }

    async findOne(id: string) {
        return await this.addressModel.findById(id);
    }

    async update(id: string | Types.ObjectId, updateAddressDto: UpdateAddressDto) {
        return await this.addressModel.findByIdAndUpdate(
            id,
            {
                ...updateAddressDto,
                updatedAt: new Date(),
            },
            { new: true },
        );
    }

    async remove(id: string) {
        return await this.addressModel.findByIdAndDelete(id);
    }
} 