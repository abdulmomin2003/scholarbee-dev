import { Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from "class-validator";
import { IsObjectId } from "nestjs-object-id";
import { DegreeLevelEnum } from "src/common/constants/shared.constants";

export class ProgramApplicantItemDto {
    @IsString()
    @IsNotEmpty()
    @IsObjectId({ message: 'programId must be a string representing a valid ObjectId format' })
    programId: string;

    @IsString()
    @IsNotEmpty()
    programName: string;

    @IsNumber()
    @IsNotEmpty()
    applicantCount: number;

    @IsString()
    @IsNotEmpty()
    @IsEnum(DegreeLevelEnum)
    degreeLevel: DegreeLevelEnum;
}

export class ApplicantsByProgramResponseDto {

    @IsNumber()
    @Min(0)
    totalApplicantCount: number;

    @IsNumber()
    @Min(0)
    totalProgramCount: number;

    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ProgramApplicantItemDto)
    programs: ProgramApplicantItemDto[];

    @IsString()
    @IsNotEmpty()
    @IsObjectId({ message: 'campusId must be a string representing a valid ObjectId format' })
    campusId: string;

    @IsDate()
    @IsNotEmpty()
    generatedAt: Date;
}

