import { IsNotEmpty } from 'class-validator';
import { IsObjectId } from 'src/common/validators/object-id.validator';
import { ToObjectId } from 'src/common/transformers/object-id.transformer';
import { Types } from 'mongoose';

/**
 * DTO for getting admission programs by academic department
 * 
 * This DTO validates the academic department ID parameter.
 * The ID is validated as a MongoDB ObjectId string and transformed to ObjectId type.
 */
export class GetAdmissionProgramsByAcademicDepartmentDto {
  @IsNotEmpty({ message: 'Academic department ID is required' })
  @IsObjectId({ message: 'Academic department ID must be a valid MongoDB ObjectId' })
  @ToObjectId()
  academic_department_id: Types.ObjectId;
}


