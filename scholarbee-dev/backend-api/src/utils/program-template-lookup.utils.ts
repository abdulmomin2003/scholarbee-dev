import { PipelineStage } from 'mongoose';
import { DB_COLLECTIONS } from 'src/common/constants/db.constants';

/**
 * Temporary field name used to store the looked-up program template document.
 * This field is added during aggregation and should be removed afterward
 * via {@link getTemplateLookupCleanupStage}.
 */
const TEMPLATE_TEMP_FIELD = '__programTemplate';

/**
 * Returns aggregation pipeline stages that look up the referenced ProgramTemplate
 * for a program document and override the program's `name`, `degree_level`, and `major`
 * fields with the template's values (with fallback to the program's own deprecated fields).
 *
 * Also adds:
 * - `short_name` sourced from `ProgramTemplate.short_name` (defaults to `null`)
 * - `seo_title_key` sourced from `ProgramTemplate.seo_title_key` (defaults to `null`)
 * - `field_of_study` sourced from `ProgramTemplate.field_of_study`
 * - `major` duplicated from `field_of_study` for backward compatibility
 * - `tags` sourced from `ProgramTemplate.tags` (defaults to `[]`)
 *
 * ### Fallback Strategy
 * All overrides use `$ifNull` so that programs without a template reference
 * gracefully fall back to their own deprecated fields. Each fallback is marked
 * with a `TEMPLATE_FALLBACK` comment for easy identification and future removal.
 *
 * @param programPath - Dot-notation path to the program document inside the
 *   aggregation context. Use `''` (default) when the root document IS the program
 *   (e.g., querying the programs collection directly). Use `'program'` when the
 *   program is a nested field after a `$lookup`.
 * @returns Array of pipeline stages: [$lookup, $unwind, $addFields]
 *
 * @example
 * // Root-level program (programs collection)
 * pipeline.push(...getTemplateLookupStages());
 *
 * @example
 * // Nested program after $lookup
 * pipeline.push(...getTemplateLookupStages('program'));
 */
export function getTemplateLookupStages(programPath: string = ''): PipelineStage[] {
  const prefix = programPath ? `${programPath}.` : '';
  const templateFieldRef = `$${prefix}template`;

  const templateNameRef = `$${TEMPLATE_TEMP_FIELD}.name`;
  const templateShortNameRef = `$${TEMPLATE_TEMP_FIELD}.short_name`;
  const templateSeoTitleKeyRef = `$${TEMPLATE_TEMP_FIELD}.seo_title_key`;
  const templateDegreeLevelRef = `$${TEMPLATE_TEMP_FIELD}.degree_level`;
  const templateFieldOfStudyRef = `$${TEMPLATE_TEMP_FIELD}.field_of_study`;
  const templateTagsRef = `$${TEMPLATE_TEMP_FIELD}.tags`;

  const programNameRef = `$${prefix}name`;
  const programDegreeLevelRef = `$${prefix}degree_level`;
  const programMajorRef = `$${prefix}major`;

  return [
    // Stage 1: Lookup the referenced program template
    {
      $lookup: {
        from: DB_COLLECTIONS.PROGRAM_TEMPLATES,
        localField: `${prefix}template`,
        foreignField: '_id',
        as: TEMPLATE_TEMP_FIELD,
      },
    },
    // Stage 2: Unwind (single template per program)
    {
      $unwind: {
        path: `$${TEMPLATE_TEMP_FIELD}`,
        preserveNullAndEmptyArrays: true,
      },
    },
    // Stage 3: Override program fields with template values (with fallback)
    {
      $addFields: {
        [`${prefix}name`]: { $ifNull: [templateNameRef, programNameRef] }, /* TEMPLATE_FALLBACK */
        [`${prefix}short_name`]: { $ifNull: [templateShortNameRef, null] },
        [`${prefix}seo_title_key`]: { $ifNull: [templateSeoTitleKeyRef, null] },
        [`${prefix}degree_level`]: { $ifNull: [templateDegreeLevelRef, programDegreeLevelRef] }, /* TEMPLATE_FALLBACK */
        [`${prefix}field_of_study`]: { $ifNull: [templateFieldOfStudyRef, programMajorRef] }, /* TEMPLATE_FALLBACK */
        [`${prefix}major`]: { $ifNull: [templateFieldOfStudyRef, programMajorRef] }, /* TEMPLATE_FALLBACK (backward compat) */
        [`${prefix}tags`]: { $ifNull: [templateTagsRef, []] },
      },
    },
  ];
}

/**
 * Returns a pipeline stage that removes the temporary template lookup field.
 * Call this after {@link getTemplateLookupStages} when you need to clean up
 * the aggregation output. If you already have a `$project` stage later in the
 * pipeline, you can skip this and exclude `__programTemplate` there instead.
 *
 * @returns A single `$project` stage that excludes the temp field
 */
export function getTemplateLookupCleanupStage(): PipelineStage {
  return { $project: { [TEMPLATE_TEMP_FIELD]: 0 } };
}

/**
 * Post-processes a program document (or plain object) returned by Mongoose
 * `.populate('template')` to merge template fields onto the program.
 *
 * This is the Mongoose-populate equivalent of {@link getTemplateLookupStages}.
 * Use this when the service uses `.populate()` instead of aggregation `$lookup`.
 *
 * ### Fields merged:
 * - `name` ← template.name (fallback: program.name)
 * - `short_name` ← template.short_name (default: null)
 * - `seo_title_key` ← template.seo_title_key (default: null)
 * - `degree_level` ← template.degree_level (fallback: program.degree_level)
 * - `field_of_study` ← template.field_of_study (fallback: program.major)
 * - `major` ← template.field_of_study (fallback: program.major) — backward compat
 * - `tags` ← template.tags (default: [])
 *
 * @param programDoc - A program document or plain object, potentially with a
 *   populated `template` field. Modified in place and returned.
 * @returns The same reference, with template fields merged.
 */
export function mergeProgramTemplateFields<T extends Record<string, unknown>>(programDoc: T): T {
  if (!programDoc) return programDoc;

  const template = programDoc.template as Record<string, unknown> | undefined | null;

  if (!template || typeof template !== 'object') {
    // No template populated — add field_of_study from major for forward compat /* TEMPLATE_FALLBACK */
    (programDoc as Record<string, unknown>).short_name = null;
    (programDoc as Record<string, unknown>).seo_title_key = null;
    (programDoc as Record<string, unknown>).field_of_study = programDoc.major ?? null;
    (programDoc as Record<string, unknown>).tags = [];
    return programDoc;
  }

  /* TEMPLATE_FALLBACK — all assignments below fall back to the program's own deprecated field */
  (programDoc as Record<string, unknown>).name = template.name ?? programDoc.name;
  (programDoc as Record<string, unknown>).short_name = template.short_name ?? null;
  (programDoc as Record<string, unknown>).seo_title_key = template.seo_title_key ?? null;
  (programDoc as Record<string, unknown>).degree_level = template.degree_level ?? programDoc.degree_level;
  (programDoc as Record<string, unknown>).field_of_study = template.field_of_study ?? programDoc.major;
  (programDoc as Record<string, unknown>).major = template.field_of_study ?? programDoc.major;
  (programDoc as Record<string, unknown>).tags = template.tags ?? [];

  // replace template field with template id
  (programDoc as Record<string, unknown>).template = template._id;


  return programDoc;
}
