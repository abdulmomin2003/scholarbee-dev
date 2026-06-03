import { EsEntity, EsField } from 'es-mapping-ts';
import { BaseMappingEntity } from '../../elasticsearch/mappings/base.mapping';

/**
 * ## TEMPLATE_MIGRATION_TODO
 * The following ES-indexed fields are currently sourced directly from Program documents:
 * - `name` → should be sourced from ProgramTemplate.name
 * - `major` → should be sourced from ProgramTemplate.field_of_study
 * - `degree_level` → should be sourced from ProgramTemplate.degree_level
 *
 * Additionally, a new `field_of_study` field and `tags` array should be added
 * once the ES indexing pipeline is updated to resolve template fields.
 */
@EsEntity({
  index: 'programs'
})
export class ProgramEntity extends BaseMappingEntity {
  @EsField({
    type: 'text',
    analyzer: 'english',
    fields: {
      keyword: {
        type: 'keyword',
        ignore_above: 256
      }
    }
  })
  name: string;

  @EsField({
    type: 'text',
    analyzer: 'english',
    fields: {
      keyword: {
        type: 'keyword',
        ignore_above: 256
      }
    }
  })
  major: string;

  @EsField({
    type: 'keyword'
  })
  degree_level: string;

  @EsField({
    type: 'keyword'
  })
  mode_of_study: string;

  @EsField({
    type: 'keyword'
  })
  campus_id: string;

  @EsField({
    type: 'keyword'
  })
  university_id: string;

  @EsField({
    type: 'keyword'
  })
  academic_departments: string[];

  @EsField({
    type: 'text',
    analyzer: 'english'
  })
  description: string;
} 