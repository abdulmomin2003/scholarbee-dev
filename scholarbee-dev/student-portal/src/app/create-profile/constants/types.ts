export interface ContactInfoProps {
  email: string;
  phone_number: string;
  fatherEmailAddress: string;
  fatherPhoneNumber: string;
  provinceOfDomicile: string;
  districtOfDomicile: string;
  stateOrProvince: string;
  city: string;
  postalCode: string;
  streetAddress: string;
}

export interface PersonalInformationProps {
  id?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  father_name: string;
  father_status: string;
  father_profession: string;
  father_income: string;
  mother_name: string;
  mother_status: string;
  mother_profession: string;
  mother_income: string;
  religion: string;
  special_person: string;
  profile_image_url: string;
  current_stage: number;
}

export interface EducationalInfoProps {
  education_level: string;
  school_college_university: string;
  field_of_study: string;
  marks_gpa: {
    total_marks_gpa: string;
    obtained_marks_gpa: string;
  };
  year_of_passing: string;
  board: string;
  transcript: string;
}

export interface ChooseProgramProps {
  applyForComputing: boolean;
  applyForAccounting: boolean;
  applyForLaw: boolean;
  applyForArchitecture: boolean;
  processingFee: string;
  preferences: string[];
}

export interface DepositDetailsState {
  bankName: string;
  depositDate: string;
  depositAmount: string;
  branchAddress: string;
  feeInvoiceUrl: string;
}

export interface VideoCardTypes {
  focused?: boolean;
  name: string;
  imageUrl: string;
  videoUrl: string;
  title: string;
  description: string;
}

export interface EducationalBackground {
  education_level?:
    | 'Matriculation'
    | 'Intermediate'
    | 'Bachelors'
    | 'Masters'
    | 'PhD';
  field_of_study?: string;
  school_college_university?: string;
  marks_gpa?: MarksGPA;
  year_of_passing?: string;
  board?: string;
  transcript?: string;
}

export interface MarksGPA {
  total_marks_gpa?: string;
  obtained_marks_gpa?: string;
}

export interface NationalIDCard {
  front_side?: string;
  back_side?: string;
}

export interface User {
  message: string;
  id?: string;
  full_name?: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  father_name: string;
  father_profession?: string;
  father_status: 'alive' | 'deceased';
  father_income?: string;
  mother_name?: string;
  mother_profession?: string;
  mother_status?: 'alive' | 'deceased';
  mother_income?: string;
  religion?: string;
  special_person: 'yes' | 'no';
  gender?: 'Male' | 'Female' | 'Other';
  nationality?: string;
  email: string;
  phone_number?: string;
  fatherEmailAddress?: string;
  fatherPhoneNumber?: string;
  provinceOfDomicile?:
    | 'punjab'
    | 'sindh'
    | 'balochistan'
    | 'khyber_pakhtunkhwa'
    | 'gilgit'
    | 'kashmir';
  districtOfDomicile?: string;
  stateOrProvince?: string;
  city?: string;
  postalCode?: string;
  streetAddress?: string;
  address_id?: string;
  user_type: 'Student' | 'Admin';
  registration_no?: string;
  university_id?: string;
  campus_id?: string;
  user_profile_id?: string;
  profile_image_url?: string;
  educational_backgrounds?: EducationalBackground[];
  national_id_card?: NationalIDCard;
  created_at?: string;
  verifyToken?: string;
  _verified?: boolean;
  isProfileCompleted?: boolean;
  current_stage: number;
}

export interface submitApplicationProps {
  status: string;
  program: string | number;
  applicant: string | number;
  admission: string | number;
  submission_date: string;
  admission_programs: string[];
}
