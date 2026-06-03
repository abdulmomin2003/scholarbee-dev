import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserNS } from 'src/users/schemas/user.schema';
import { AdmissionProgram, AdmissionProgramDocument } from 'src/admission-programs/schemas/admission-program.schema';
import { UserEvent, UserEventDocument } from '../schemas/user-event.schema';
import { UserRecommendationEventType, RecommendationResourceType } from '../types/recommendation.types';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(AdmissionProgram.name)
    private readonly admissionProgramModel: Model<AdmissionProgramDocument>,
    @InjectModel(UserEvent.name)
    private readonly userEventModel: Model<UserEventDocument>,
  ) {}

  /**
   * Seeds demo recommendation preferences and behavioral logs for a test user.
   */
  async seedDemoData(): Promise<any> {
    this.logger.log('Starting recommendation system demo data seeding...');

    // 1. Create or update test student
    let testUser = await this.userModel.findOne({ email: 'recs-demo-student@scholarbee.com' }).exec();
    if (!testUser) {
      testUser = new this.userModel({
        full_name: 'Demo Student for Recommendations',
        first_name: 'Demo',
        last_name: 'Student',
        email: 'recs-demo-student@scholarbee.com',
        user_type: UserNS.UserType.Student,
        _verified: true,
      });
    }

    // Set sample onboarding preferences
    testUser.onboarding_preferences = {
      degree_goal: UserNS.OnboardingDegreeGoal.Bachelors,
      preferred_cities: ['Islamabad', 'Lahore'],
      preferred_fields_of_study: ['Computer Science', 'Data Science'],
      semester_fee_range: {
        min: 100000,
        max: 300000,
      },
      previous_marks_range: {
        min_percent: 75,
        max_percent: 95,
      },
      updated_at: new Date(),
    };

    await testUser.save();
    this.logger.log(`Created/updated demo user: ${testUser.email} with onboarding preferences`);

    // 2. Fetch some admission programs to simulate clicks
    const programs = await this.admissionProgramModel.find().limit(3).exec();
    if (programs.length > 0) {
      // Clear previous events for this demo user
      await this.userEventModel.deleteMany({ user_id: testUser._id }).exec();

      // Create synthetic click events
      const simulatedEvents = [];
      for (let i = 0; i < 12; i++) { // 12 clicks to exceed behavioral threshold of 10
        const randomProg = programs[i % programs.length];
        simulatedEvents.push({
          user_id: testUser._id,
          event_type: UserRecommendationEventType.CLICK,
          resource_type: RecommendationResourceType.ADMISSION_PROGRAM,
          resource_id: randomProg._id,
          created_at: new Date(Date.now() - i * 3600 * 1000), // clicks spread over hours
        });
      }
      await this.userEventModel.insertMany(simulatedEvents);
      this.logger.log(`Inserted ${simulatedEvents.length} synthetic behavioral click events for the demo user.`);
    } else {
      this.logger.warn('No active admission programs found in the database. Run normal database seeds first.');
    }

    return {
      message: 'Recommendation system demo data seeded successfully!',
      testUser: {
        id: testUser._id,
        email: testUser.email,
        preferences: testUser.onboarding_preferences,
      },
      simulatedEventsCount: programs.length > 0 ? 12 : 0,
    };
  }
}
