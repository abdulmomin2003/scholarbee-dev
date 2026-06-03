// import { ElasticsearchAdmissionProgramDocument } from "./admission-program.types";

interface Address {
  id: string;
  address_line_1: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  created_at: string;
  createdAt: string;
  updatedAt: string;
}

interface FeeStructure {
  tuition_fee: string;
}

interface University {
  id: string;
  name: string;
  founded: string;
  description: string;
  website: string;
  ranking: string;
  affiliations: string;
  logo_url: string;
  created_at: string;
  createdAt: string;
  updatedAt: string;
  colors: string;
  motto: string;
  total_faculty: number;
  total_students: number;
  type: string;
  annual_budget: number;
  campus_size?: string;
  endowment: string;
  international_students: number;
  languages: string;
  mascot: string;
  notable_alumni: string;
  research_output: number;
  total_alumni: number;
  address_id: Address;
}

interface Campus {
  address: {
    city: string;
    country: string;
  };
  id: string;
  university_id: University;
  name: string;
  contact_phone: string;
  contact_email: string;
  website: string;
  created_at: string;
  createdAt: string;
  updatedAt: string;
  facilities: string;
  latitude: number;
  longitude: number;
  accreditations: string;
  campus_type: string;
  established_date: string;
  student_population: number;
  dining_options: boolean;
  healthcare_facilities: boolean;
  library_facilities: boolean;
  parking_facilities: boolean;
  residential_facilities: boolean;
  security_features: boolean;
  sports_facilities: boolean;
  transportation_options: boolean;
  logo_url: string;
}

interface AdmissionRequirement {
  key: string;
  value: string;
  id: string;
}

interface AdmissionAnnouncement {
  key: string;
  value: string;
  id: string;
}

interface Admission {
  campus: Campus;
  university: University;
  id: string;
  university_id: University;
  program_id: string;
  course_id: string;
  admin_id: string;
  admission_title: string;
  admission_description: string;
  admission_deadline: string;
  created_at: string;
  createdAt: string;
  updatedAt: string;
  admission_requirements: AdmissionRequirement[];
  admission_startdate: string;
  available_seats: number;
  admission_announcements: AdmissionAnnouncement[];
  campus_id: Campus;
}

interface IntakePeriod {
  intake_period: string;
  id: string;
}

export interface Program {
  id?: string;
  _id: string;
  campus_id: Campus;
  name: string;
  major: string;
  intake_periods: IntakePeriod[];
  created_at: string;
  createdAt: string;
  updatedAt: string;
  degree_level: string;
  language_of_instruction: string;
  mode_of_study: string;
  scholarship_options: string;
  duration?: string;
  credit_hours?: number;
  accreditations?: string;
  academic_departments?: string;
  programs_template?: string;
  program_type_template?: string;
  createdBy?: string;
  __v?: number;
}

export interface CampusProgramResponse {
  programs: Program[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UniversityAdmission {
  _id: string;
  admission: Admission;
  favouriteBy: string[];
  program: Program;
  created_at: string;
  createdAt: string;
  updatedAt: string;
  fee_structures: FeeStructure[];
}

interface Organization {
  id: string;
  organization_name: string;
  organization_type: string;
  website_url: string;
  createdAt: string;
  updatedAt: string;
}

interface RequiredDocument {
  id: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  user_type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  educational_backgrounds: any[];
  national_id_card: Record<string, unknown>;
  created_at: string;
  _verified: boolean;
  isProfileCompleted: boolean;
  createdBy: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  current_stage: number;
  verifyToken: string;
  loginAttempts: number;
}

export interface Scholarship {
  id: string;
  scholarship_name: string;
  scholarship_description: string;
  eligibility_criteria: string;
  amount: number;
  application_deadline: string;
  scholarship_type: 'need' | 'merit' | string; // Add other types if needed
  organization_id: Organization;
  required_documents: RequiredDocument[];
  status: 'open' | 'closed' | string; // Add other status types if needed
  created_at: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

// Optional: If you need pagination response type
export interface ScholarshipResponse {
  docs: Scholarship[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}
