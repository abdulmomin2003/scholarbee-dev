import { Test, TestingModule } from '@nestjs/testing';
import { BayesianWeightService } from './bayesian-weight.service';
import { KnowledgeGraphService } from './knowledge-graph.service';
import { DEFAULT_PRIORS } from '../types/bayesian-weights.types';

describe('BayesianWeightService', () => {
  let service: BayesianWeightService;
  let knowledgeGraphService: KnowledgeGraphService;

  beforeEach(async () => {
    const mockKnowledgeGraphService = {
      getFieldSimilarity: jest.fn().mockReturnValue(0.0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BayesianWeightService,
        { provide: KnowledgeGraphService, useValue: mockKnowledgeGraphService },
      ],
    }).compile();

    service = module.get<BayesianWeightService>(BayesianWeightService);
    knowledgeGraphService = module.get<KnowledgeGraphService>(KnowledgeGraphService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDefaultWeights', () => {
    it('should return weights that sum to 1.0', () => {
      const defaultWeights = service.getDefaultWeights();
      expect(defaultWeights.degree_match).toBeCloseTo(0.25 / 0.85);
      expect(defaultWeights.field_match).toBeCloseTo(0.25 / 0.85);
      expect(defaultWeights.city_match).toBeCloseTo(0.20 / 0.85);
      expect(defaultWeights.fee_match).toBeCloseTo(0.15 / 0.85);
      
      const sum = defaultWeights.degree_match + defaultWeights.field_match + defaultWeights.city_match + defaultWeights.fee_match;
      expect(sum).toBeCloseTo(1.0);
    });
  });

  describe('updateWeights', () => {
    const mockStudent = {
      onboarding_preferences: {
        degree_goal: 'Bachelors',
        preferred_cities: ['Islamabad'],
        preferred_fields_of_study: ['Computer Science'],
        semester_fee_range: { min: 100000, max: 200000 },
      },
    };

    const matchedProgram = {
      degree_level: 'Bachelors',
      field: 'Computer Science',
      city: 'Islamabad',
      first_semester_fee: 150000,
    };

    it('should increase city_match alpha when clicking a city-matched program', () => {
      const initialWeights = service.getWeights(DEFAULT_PRIORS);
      
      let priors = { ...DEFAULT_PRIORS };
      for (let i = 0; i < 5; i++) {
        priors = service.updateWeights(priors, {
          program: matchedProgram,
          student: mockStudent,
          action: 'click',
        });
      }

      const updatedWeights = service.getWeights(priors);
      expect(updatedWeights.city_match).toBeGreaterThan(initialWeights.city_match);
    });

    it('should decrease city_match weight when ignoring city-matched programs', () => {
      const initialWeights = service.getWeights(DEFAULT_PRIORS);
      
      let priors = { ...DEFAULT_PRIORS };
      for (let i = 0; i < 5; i++) {
        priors = service.updateWeights(priors, {
          program: matchedProgram,
          student: mockStudent,
          action: 'ignore',
        });
      }

      const updatedWeights = service.getWeights(priors);
      expect(updatedWeights.city_match).toBeLessThan(initialWeights.city_match);
    });

    it('should have 3x the update magnitude for apply compared to click', () => {
      const priorsClick = service.updateWeights(DEFAULT_PRIORS, {
        program: matchedProgram,
        student: mockStudent,
        action: 'click',
      });

      const priorsApply = service.updateWeights(DEFAULT_PRIORS, {
        program: matchedProgram,
        student: mockStudent,
        action: 'apply',
      });

      const diffClick = priorsClick.degree_match.alpha - DEFAULT_PRIORS.degree_match.alpha;
      const diffApply = priorsApply.degree_match.alpha - DEFAULT_PRIORS.degree_match.alpha;

      expect(diffApply).toBe(3 * diffClick);
    });

    it('should always return normalized weights that sum to 1.0', () => {
      const priors = service.updateWeights(DEFAULT_PRIORS, {
        program: matchedProgram,
        student: mockStudent,
        action: 'favorite',
      });

      const weights = service.getWeights(priors);
      const sum = weights.degree_match + weights.field_match + weights.city_match + weights.fee_match;
      expect(sum).toBeCloseTo(1.0);
    });
  });
});
