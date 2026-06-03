import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';
import { DegreeLevelEnum } from 'src/common/constants/shared.constants';

/**
 * ProgramTemplate Document Type
 */
export type ProgramTemplateDocument = ProgramTemplate & Document;

/**
 * Program Template Schema
 * 
 * Represents a reusable template for academic programs. Templates define
 * common attributes that can be referenced by multiple Program documents.
 * 
 * Relationship with Program:
 * - Program.template (ObjectId) -> ProgramTemplate._id
 * - Program.major maps to ProgramTemplate.field_of_study
 * - ProgramTemplate.tags are used for filtering/searching programs
 * - ProgramTemplate.description is template-specific and not inherited by programs
 * 
 * @example
 * {
 *   name: 'Bachelor of Computer Science',
 *   short_name: 'BS Computer Science',
 *   seo_title_key: 'bs-computer-science',
 *   degree_level: 'Bachelors',
 *   field_of_study: 'Computer Science',  // Maps to Program.major
 *   tags: ['technology', 'stem', 'engineering'],
 *   description: 'A comprehensive CS program covering fundamentals'
 * }
 */
@Schema({ timestamps: true, collection: DB_COLLECTIONS.PROGRAM_TEMPLATES })
export class ProgramTemplate {
    /**
     * Display name of the program template
     * @example 'Bachelor of Computer Science'
     */
    @Prop({ type: String, required: true })
    name: string;

    /**
     * Short display name of the program template
     * @example 'BS Computer Science', 'Bachelor of Business Administration', 'MBA Finance'
     */
    @Prop({ type: String, required: false })
    short_name?: string;

    /**
     * SEO-friendly title key used for URL generation and lookups
     * @example 'bs-computer-science', 'bachelor-business-administration'
     */
    @Prop({ type: String, required: false })
    seo_title_key?: string;

    /**
     * Academic level of the program
     * @example 'Bachelors', 'Masters', 'Doctorate', 'Diploma'
     * @see DegreeLevelEnum in shared.constants.ts for valid values
     */
    @Prop({ type: String, enum: DegreeLevelEnum, required: true })
    degree_level: DegreeLevelEnum;

    /**
     * Primary field or discipline of study
     * This maps to Program.major when a program references this template
     * @example 'Computer Science', 'Electrical Engineering', 'Business Administration'
     */
    @Prop({ type: String, required: false })
    field_of_study?: string;

    /**
     * Array of tags for categorization and filtering
     * Used in program queries to filter by template tags
     * @example ['technology', 'stem', 'engineering', 'high-demand']
     */
    @Prop({ type: [String], default: [] })
    tags?: string[];

    /**
     * Template-specific description
     * Note: This is scoped to the template only and is NOT inherited by Program documents
     * @example 'A comprehensive program covering computer science fundamentals and practical skills'
     */
    @Prop({ type: String, required: false })
    description?: string;
}

export const ProgramTemplateSchema = SchemaFactory.createForClass(ProgramTemplate);
