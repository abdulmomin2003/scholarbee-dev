import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UniversityDetailListQueryDto {
    @ApiProperty({
        description: 'University slug to filter by',
        example: 'national-university-of-sciences-and-technology',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    slug: string;

    @ApiProperty({
        description: 'City name',
        example: 'Islamabad',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({
        description: 'Campus ID to use as the featured campus in the response; By default, the primary campus is used',
        example: '66d300000000000000000000',
        required: false,
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    // @IsObjectId() // object-id.validator
    // @ToObjectId() // object-id.transformer
    selectedCampusId?: string;
}
