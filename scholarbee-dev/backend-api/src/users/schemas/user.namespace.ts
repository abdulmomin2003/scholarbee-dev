import { Types } from 'mongoose';
import { DegreeLevelEnum } from 'src/common/constants/shared.constants';

/**
 * TypeScript namespace with user-related enums and plain shapes (for DTOs / services).
 */
export namespace UserNS {
  export enum AuthProvider {
    Local = 'local',
    Google = 'google',
    Facebook = 'facebook',
    LinkedIn = 'linkedin',
    GitHub = 'github',
  }
  export enum UserType {
    Student = 'Student',
    // Admin = 'Admin',
    Campus_Admin = 'Admin',
    Super_Admin = 'Super_Admin',
  }

  export enum DiscoveryMode {
    Instagram = 'instagram',
    TikTok = 'tiktok',
    Facebook = 'facebook',
    Invitation = 'invitation',
    Others = 'others',
  }

  export enum ProvinceOfDomicile {
    KhyberPakhtunkhwa = 'khyber_pakhtunkhwa',
    Punjab = 'punjab',
    Sindh = 'sindh',
    Balochistan = 'balochistan',
    Kashmir = 'kashmir',
    Gilgit = 'gilgit',
    Islamabad = 'islamabad',
  }

  /**
   * Canonical degree goal values captured from onboarding flow.
   * Built on shared DegreeLevelEnum values to align with existing system semantics.
   * Transfer/Migration is a valid onboarding-only extension.
   */
  export enum OnboardingDegreeGoal {
    Matriculation = DegreeLevelEnum.Matriculation,
    IntermediateFScFA = DegreeLevelEnum.IntermediateFScFA,
    Diploma = DegreeLevelEnum.Diploma,
    Associate = DegreeLevelEnum.Associate,
    Bachelors = DegreeLevelEnum.Bachelors,
    Masters = DegreeLevelEnum.Masters,
    Phd = DegreeLevelEnum.Doctorate,
    TransferMigration = 'transfer_migration',
  }

  /**
   * Canonical timeline options from onboarding flow.
   * "Just exploring" is intentionally stored as null, not a string enum member.
   */
  export enum OnboardingStartTimelineType {
    Immediate = 'immediate',
    Within6Months = 'within_6_months',
    NextYear = 'next_year',
  }

  export interface IOnboardingRangeValue {
    min?: number | null;
    max?: number | null;
  }

  export interface IOnboardingMarksRange {
    min_percent?: number | null;
    max_percent?: number | null;
  }

  export interface IOnboardingStartTimeline {
    type?: OnboardingStartTimelineType | null;
    selected_at?: Date;
  }

  export interface IOnboardingPreferences {
    degree_goal?: OnboardingDegreeGoal | null;
    preferred_cities?: string[];
    preferred_fields_of_study?: string[];
    semester_fee_range?: IOnboardingRangeValue;
    previous_marks_range?: IOnboardingMarksRange;
    start_timeline?: IOnboardingStartTimeline;
    version?: number;
    updated_at?: Date;
  }
  // Educational background interfaces
  export interface IMarksGPA {
    total_marks_gpa: string;
    obtained_marks_gpa: string;
  }

  export interface IEducationalBackground {
    _id: Types.ObjectId;
    board?: string; // Optional
    education_level: DegreeLevelEnum; // Required
    field_of_study?: string; // Optional
    marks_gpa: IMarksGPA; // Required
    school_college_university?: string; // Optional
    transcript?: string; // Optional
    year_of_passing?: string; // Optional
  }

  export interface INationalIdCard {
    front_side?: string;
    back_side?: string;
  }
}
