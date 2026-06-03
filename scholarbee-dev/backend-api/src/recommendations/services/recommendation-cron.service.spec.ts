import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { User } from 'src/users/schemas/user.schema';
import { RecommendationService } from './recommendation.service';
import { RecommendationCronService } from './recommendation-cron.service';

describe('RecommendationCronService', () => {
  let cronService: RecommendationCronService;
  let recommendationService: RecommendationService;
  let mockUserModel: any;

  beforeEach(async () => {
    mockUserModel = {
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        { _id: 'student_id_1' },
        { _id: 'student_id_2' },
      ]),
    };

    const mockRecommendationService = {
      precomputeTrendingRecommendations: jest.fn().mockResolvedValue(undefined),
      precomputeStudentRecommendations: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationCronService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
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

  describe('recomputeRecommendations', () => {
    it('should query for student users and call precomputation on recommendation service', async () => {
      await cronService.recomputeRecommendations();

      // Verify Mongoose query
      expect(mockUserModel.find).toHaveBeenCalledWith({ user_type: 'Student' });
      expect(mockUserModel.select).toHaveBeenCalledWith('_id');
      expect(mockUserModel.lean).toHaveBeenCalled();
      expect(mockUserModel.exec).toHaveBeenCalled();

      // Verify RecommendationService calls
      expect(recommendationService.precomputeTrendingRecommendations).toHaveBeenCalled();
      expect(recommendationService.precomputeStudentRecommendations).toHaveBeenCalledWith('student_id_1');
      expect(recommendationService.precomputeStudentRecommendations).toHaveBeenCalledWith('student_id_2');
    });

    it('should handle precomputation errors gracefully without crashing', async () => {
      jest
        .spyOn(recommendationService, 'precomputeStudentRecommendations')
        .mockRejectedValueOnce(new Error('Redis Timeout'));

      await expect(cronService.recomputeRecommendations()).resolves.not.toThrow();

      expect(recommendationService.precomputeTrendingRecommendations).toHaveBeenCalled();
      expect(recommendationService.precomputeStudentRecommendations).toHaveBeenCalledTimes(2);
    });
  });

  describe('manuallyTriggerPrecomputation', () => {
    it('should invoke recomputeRecommendations', async () => {
      const recomputeSpy = jest
        .spyOn(cronService, 'recomputeRecommendations')
        .mockResolvedValue(undefined);

      await cronService.manuallyTriggerPrecomputation();

      expect(recomputeSpy).toHaveBeenCalled();
    });
  });
});
