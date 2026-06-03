import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, InferSchemaType, Schema as MongooseSchema, Types } from 'mongoose';
import { AcademicDepartment } from 'src/academic-departments/schemas/academic-department.schema';
import { Campus } from 'src/campuses/schemas/campus.schema';
import { DocumentWithDeleted, SoftDeletePlugin } from 'src/common/plugins/soft-delete.plugin';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import { DegreeLevelEnum } from 'src/common/constants/shared.constants';
import { FeeStructure } from 'src/fee-structures/schemas/fee-structure.schema';
import { ProgramTemplate } from 'src/program-templates/schemas/program-template.schema';
import { WithObjectId } from 'src/utils/db.utils';

export enum ProgramDurationEnum {
  Months_12 = "12 Months", // 1 Year
  Months_18 = "18 Months", // 1.5 Years
  Months_24 = "24 Months", // 2 Years
  Months_36 = "36 Months", // 3 Years
  Months_48 = "48 Months", // 4 Years
  Months_60 = "60 Months", // 5 Years
}

export enum ModeOfStudyEnum {
  Onsite = 'Onsite',
  Online = 'Online',
  Hybrid = 'Hybrid',
}

// Array of standardized majors for programs
export const program_major_options = [
  "Accountancy",
  "Accounting & Finance",
  "Aerospace Engineering",
  "Agriculture & Food Sciences",
  "Allied Health Sciences",
  "Architecture & Planning",
  "Artificial Intelligence",
  "Arts",
  "Arts, Fashion and Textile",
  "Aviation Management",
  "Basic Medical",
  "BioInformatics",
  "Biochemistry",
  "Biological Sciences",
  "Biomedical Engineering",
  "Biomedical Sciences",
  "Biotechnology",
  "Botany",
  "Business",
  "Business & Management",
  "Business Management",
  "Chemical Engineering",
  "Chemistry",
  "Civil Engineering",
  "Commerce",
  "Communication Studies",
  "Computer Engineering",
  "Computer Science",
  "Computer Systems",
  "Computing",
  "Criminology",
  "Cyber Security",
  "Data Science",
  "Data Sciences",
  "Defence & Strategic Studies",
  "Defence and Strategic studies",
  "Dental Materials",
  "Dental Surgery",
  "Dental Technology",
  "Dentist",
  "Design & Arts",
  "Diagnosis and Treatment",
  "Digital Systems Anb Techognoly",
  "Docter",
  "Dot",
  "Ear, Nose, and Throat (ENT)",
  "Ear, Nose, and Throat (ent)",
  "Earth & Environmental Sciences",
  "Economics",
  "Education",
  "Elecrtical",
  "Electrical Engineering",
  "Electronic Engineering",
  "Electronics Engineering",
  "Electronics Engineering and Management",
  "English",
  "Environmental Science",
  "Environmental Sciences",
  "Fashion",
  "Games Programming",
  "Governance and public policy",
  "Health Care",
  "Health Care Management",
  "Health Research",
  "Human Genetics",
  "Industrial Engineering",
  "Industrial Management",
  "Information Technology",
  "International Relations",
  "Internet of Things",
  "Islamic Studies",
  "Languages",
  "Law",
  "Library & Information Science",
  "MLT",
  "Management  Sciences",
  "Management Sciences",
  "Mangement",
  "Mass-Communication",
  "Mathematics",
  "Mathematics & Statistics",
  "Matrics",
  "Mechanical Engineering",
  "Mechatronic Engineering",
  "Mechatronics",
  "Media & Communication",
  "Medical Laboratory Technology",
  "Medical Laboratory Technology (MLT)",
  "Medical Ultrasound Technology",
  "Medicine",
  "Mineral Processing Engineering",
  "Nursing",
  "Operation Theater Technology",
  "Orthodontics",
  "Other",
  "Pathology",
  "PhD Theriogenology- UVAS, Ravi",
  "Pharmacology",
  "Pharmacy",
  "Philosophy",
  "Physical Therapy",
  "Physics",
  "Physiology",
  "Physiology & Biochemistry",
  "Physiotherapy",
  "Political Science",
  "Psychology",
  "Public Health",
  "Robotics",
  "Social Sciences",
  "Software Engineering",
  "Stats",
  "Surgery",
  "Telecommunication Engineering",
  "Therapy",
  "Theriogenology",
  "Tourism & Hospitality Management"
] as const;

/**
 * Program Schema
 * 
 * Represents an academic program offered by a campus. Programs can reference
 * a ProgramTemplate via the `template` field to inherit common attributes
 * like name, degree_level, field_of_study, and tags.
 * 
 * ## Template Relationship
 * When a Program has a `template` reference:
 * - ProgramTemplate.field_of_study maps to Program.major
 * - ProgramTemplate.degree_level should be used for degree level queries
 * - ProgramTemplate.tags should be used for tag-based filtering
 * - ProgramTemplate.name should be used as the canonical program name
 * 
 * ## Deprecation Notice
 * The following fields are deprecated and will be removed once all queries
 * are migrated to use the ProgramTemplate reference:
 * - `name` - Use ProgramTemplate.name via template reference
 * - `degree_level` - Use ProgramTemplate.degree_level via template reference
 * - `major` - Use ProgramTemplate.field_of_study via template reference
 */
@Schema({ timestamps: true, collection: DB_COLLECTIONS.PROGRAMS })
export class Program {
  /**
   * Program display name
   * @deprecated Use ProgramTemplate.name via the `template` reference.
   * This field will be removed once queries are migrated to use the template.
   */
  /**
   * @deprecated Use ProgramTemplate.name via the `template` reference.
   * Kept in schema for backward compatibility with existing data.
   */
  @Prop({ type: String, required: false })
  name?: string;

  /**
   * SEO-friendly URL slug for the program
   * Format: {campusName}-{programName} or just {programName} if no campus
   * Example: "nust-main-computer-science" or "computer-science"
   * Automatically generated during creation if not provided
   * Must be unique across all programs
   */
  @Prop({ unique: true, index: true, sparse: true })
  slug: string;

  /**
   * Program major/specialization
   * @deprecated Use ProgramTemplate.field_of_study via the `template` reference.
   * This field maps to ProgramTemplate.field_of_study and will be removed
   * once queries are migrated to use the template.
   */
  @Prop({ type: String, required: false })
  major?: string;

  @Prop({ type: String, enum: ProgramDurationEnum, required: false })
  duration?: ProgramDurationEnum;

  @Prop({ type: Number, required: false })
  credit_hours?: number;

  @Prop({ type: String, required: false })
  language_of_instruction?: string;

  /**
   * Degree level of the program
   * @deprecated Use ProgramTemplate.degree_level via the `template` reference.
   * This field will be removed once queries are migrated to use the template.
   */
  /**
   * @deprecated Use ProgramTemplate.degree_level via the `template` reference.
   * Kept in schema for backward compatibility with existing data.
   */
  @Prop({ type: String, enum: DegreeLevelEnum, required: false })
  degree_level?: DegreeLevelEnum;

  @Prop({ type: String, required: false })
  accreditations?: string;

  @Prop({
    type: Types.ObjectId,
    ref: FeeStructure.name,
    required: false,
  })
  fee_structure?: Types.ObjectId;

  @Prop({ type: String, enum: ModeOfStudyEnum, required: false })
  mode_of_study?: ModeOfStudyEnum;

  @Prop({ type: String, required: false })
  scholarship_options?: string;

  @Prop({ type: String, required: false })
  sorting_weight?: string;

  @Prop({ type: Types.ObjectId, ref: Campus.name, required: true })
  campus_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: AcademicDepartment.name, required: false })
  academic_departments?: Types.ObjectId;

  @Prop({
    type: [
      {
        intake_period: { type: String, required: true },
        id: { type: String, required: false },
      },
    ],
    required: false,
  })
  intake_periods?: Array<{
    intake_period: string;
    id?: string;
  }>;

  /**
   * Reference to the ProgramTemplate
   * 
   * Links this program to a template that provides:
   * - `name`: Canonical program name (use instead of Program.name)
   * - `degree_level`: Degree level (use instead of Program.degree_level)
   * - `field_of_study`: Field of study (maps to Program.major)
   * - `tags`: Array of tags for filtering and categorization
   * 
   * Note: ProgramTemplate.description is template-specific and NOT
   * intended for use in Program documents.
   */
  @Prop({
    type: Types.ObjectId,
    ref: ProgramTemplate.name,
    required: true,
  })
  template: Types.ObjectId;
}

export type ProgramDocument = DocumentWithDeleted<WithObjectId<InferSchemaType<typeof ProgramSchema>>>


export const ProgramSchema = SchemaFactory.createForClass(Program);

// Apply the plugin
ProgramSchema.plugin(SoftDeletePlugin);