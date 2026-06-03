import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeGraphService } from './knowledge-graph.service';

describe('KnowledgeGraphService', () => {
  let service: KnowledgeGraphService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnowledgeGraphService],
    }).compile();

    service = module.get<KnowledgeGraphService>(KnowledgeGraphService);
    // Explicitly call onModuleInit to populate similarity map
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFieldSimilarity', () => {
    it('should return 1.0 for the same field', () => {
      expect(service.getFieldSimilarity('Computer Science', 'BS CS')).toBe(1.0);
    });

    it('should return correct similarity for CS -> Data Science (> 0.7)', () => {
      const similarity = service.getFieldSimilarity('computer_science', 'data_science');
      expect(similarity).toBeGreaterThan(0.7);
      expect(similarity).toBeLessThanOrEqual(1.0);
    });

    it('should return correct similarity for CS -> Fine Arts (< 0.2)', () => {
      // Fine Arts is not in our taxonomy, so similarity should be 0
      const similarity = service.getFieldSimilarity('computer_science', 'Fine Arts');
      expect(similarity).toBeLessThan(0.2);
      expect(similarity).toBe(0.0);
    });

    it('should correctly calculate two-hop relationship with 0.7 penalty', () => {
      // software_engineering -> data_science via computer_science
      // direct SE -> DS: none (0)
      // SE -> CS: 0.9, CS -> DS: 0.8
      // Two-hop: 0.9 * 0.8 * 0.7 = 0.504
      const similarity = service.getFieldSimilarity('software_engineering', 'data_science');
      expect(similarity).toBe(0.504);
    });
  });

  describe('normalizeFieldName', () => {
    it('should normalize at least 10 alias cases correctly', () => {
      const testCases = [
        { raw: 'BS Computer Science', expected: 'computer_science' },
        { raw: 'B.S. (CS)', expected: 'computer_science' },
        { raw: 'Computing', expected: 'computer_science' },
        { raw: 'BS SE', expected: 'software_engineering' },
        { raw: 'BS IT', expected: 'information_technology' },
        { raw: 'ICT', expected: 'information_technology' },
        { raw: 'BS AI', expected: 'artificial_intelligence' },
        { raw: 'BBA (Hons)', expected: 'business_administration' },
        { raw: 'Pharm-D', expected: 'pharmacy' },
        { raw: 'LLB', expected: 'law' },
        { raw: 'Mass Communication', expected: 'media_studies' },
      ];

      for (const { raw, expected } of testCases) {
        expect(service.normalizeFieldName(raw)).toBe(expected);
      }
    });
  });

  describe('getRelatedFields', () => {
    it('should return related fields sorted by score descending', () => {
      const related = service.getRelatedFields('computer_science');
      expect(related.length).toBeGreaterThan(0);
      expect(related[0].field).toBe('software_engineering');
      expect(related[0].score).toBe(0.9);
      
      // Verify sorting
      for (let i = 0; i < related.length - 1; i++) {
        expect(related[i].score).toBeGreaterThanOrEqual(related[i+1].score);
      }
    });
  });
});
