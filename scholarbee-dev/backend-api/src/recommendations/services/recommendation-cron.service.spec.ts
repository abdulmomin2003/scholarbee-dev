import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService } from './recommendation.service';
import { RecommendationCronService } from './recommendation-cron.service';

describe('RecommendationCronService', () => {
  let cronService: RecommendationCronService;
  let recommendationService: RecommendationService;

  beforeEach(async () => {
    const mockRecommendationService = {
      precomputeTrendingRecommendations: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationCronService,
        {
          provide: RecommendationService,
          useValue: mockRecommendationService,
        },
      ],
    }).compile();

    cronService = module.get<RecommendationCronService>(RecommendationCronService);
    recommendationService = module.get<RecommendationService>(RecommendationService);
  });

  it('should be defined', () => {
    expect(cronService).toBeDefined();
  });

  describe('recomputeTrendingRecommendations', () => {
    it('should call precomputeTrendingRecommendations on recommendation service', async () => {
      await cronService.recomputeTrendingRecommendations();

      expect(recommendationService.precomputeTrendingRecommendations).toHaveBeenCalled();
    });

    it('should handle precomputation errors gracefully without crashing', async () => {
      jest
        .spyOn(recommendationService, 'precomputeTrendingRecommendations')
        .mockRejectedValueOnce(new Error('Redis Timeout'));

      await expect(cronService.recomputeTrendingRecommendations()).resolves.not.toThrow();

      expect(recommendationService.precomputeTrendingRecommendations).toHaveBeenCalled();
    });
  });

  describe('manuallyTriggerPrecomputation', () => {
    it('should invoke recomputeTrendingRecommendations', async () => {
      const recomputeSpy = jest
        .spyOn(cronService, 'recomputeTrendingRecommendations')
        .mockResolvedValue(undefined);

      await cronService.manuallyTriggerPrecomputation();

      expect(recomputeSpy).toHaveBeenCalled();
    });
  });
});
