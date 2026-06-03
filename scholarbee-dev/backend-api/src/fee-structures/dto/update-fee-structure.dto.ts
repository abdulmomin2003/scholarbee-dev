import { PartialType } from '@nestjs/mapped-types';
import { CreateFeeDto } from './create-fee-structure.dto';

export class UpdateFeeDto extends PartialType(CreateFeeDto) { } 