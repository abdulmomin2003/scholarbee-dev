import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCampusDto } from './create-campus.dto';

export class UpdateCampusDto extends PartialType(
    OmitType(CreateCampusDto, ['university_id', 'is_primary'])
) { } 