import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { FIELD_ALIASES, PRECOMPUTED_SIMILARITY_MAP, SimilarityMap } from '../data';

@Injectable()
export class KnowledgeGraphService implements OnModuleInit {
  private readonly logger = new Logger(KnowledgeGraphService.name);
  private similarityMap: SimilarityMap = {};

  onModuleInit() {
    this.logger.log('Initializing Knowledge Graph Service and loading similarity map...');
    // Cache the pre-computed map in memory
    this.similarityMap = PRECOMPUTED_SIMILARITY_MAP;
    this.logger.log('Knowledge Graph similarity map cached successfully.');
  }

  /**
   * Cleans a raw field name string for alias mapping.
   */
  private cleanFieldName(raw: string): string {
    if (!raw) return '';
    return raw
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/[()]/g, '')
      .replace(/-/g, ' ')
      .replace(/&/g, 'and')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Normalizes a raw field name to a canonical snake_case field ID.
   */
  normalizeFieldName(raw: string): string {
    const cleaned = this.cleanFieldName(raw);
    if (!cleaned) return '';

    // Check alias map
    if (FIELD_ALIASES[cleaned]) {
      return FIELD_ALIASES[cleaned];
    }

    // Default fallback: return snake_case version of the cleaned string
    return cleaned.replace(/\s+/g, '_');
  }

  /**
   * Gets the similarity score between two fields (0.0 to 1.0).
   */
  getFieldSimilarity(field1: string, field2: string): number {
    if (!field1 || !field2) return 0.0;

    const norm1 = this.normalizeFieldName(field1);
    const norm2 = this.normalizeFieldName(field2);

    if (norm1 === norm2) {
      return 1.0;
    }

    const score = this.similarityMap[norm1]?.[norm2];
    return score !== undefined ? score : 0.0;
  }

  /**
   * Returns a list of related fields and their similarity scores.
   */
  getRelatedFields(fieldId: string): Array<{ field: string; score: number }> {
    const normId = this.normalizeFieldName(fieldId);
    const relations = this.similarityMap[normId];
    if (!relations) {
      return [];
    }

    return Object.entries(relations)
      .filter(([field, score]) => field !== normId && score > 0)
      .map(([field, score]) => ({ field, score }))
      .sort((a, b) => b.score - a.score);
  }
}
