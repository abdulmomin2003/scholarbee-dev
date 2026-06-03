/* eslint-disable @typescript-eslint/no-explicit-any */
// shared/types.ts
import { Control, FieldErrors } from 'react-hook-form';

export interface CampusAddress {
  city: string;
  country: string;
}

export interface University {
  id: string;
  name: string;
}

export interface Campus {
  _id: string;
  name: string;
}

export interface Program {
  _id: string;
  name: string;
}

export interface FilterFormData {
  university: University | null;
  campus: string;
  program: string;
}

export interface Tag {
  _id: string;
  university: string;
  campus: string;
  program: string;
}

export interface UniversityData {
  _id: string;
  programName: string;
  major: string;
  duration: string;
  creditHours: string | number;
  degreeLevel: string;
  modeOfStudy: string;
  languageOfInstruction: string;
  campusName: string;
  campusLogo: string;
  universityName: string;
  universityRanking: string;
  totalTuitionFee?: number;
  totalApplicationFee?: number;
  totalFee?: number;
  totalFirstSemesterFee: number;
  totalRegularSemesterFee: number;
  campusAddress: CampusAddress;
}

export interface ComparisonCriteria {
  id: string;
  label: string;
  key: keyof UniversityData;
  formatValue?: (value: any) => string;
}

export interface FilterFormProps {
  control: Control<FilterFormData>;
  errors: FieldErrors<FilterFormData>;
  watch: any;
  programs: Program[];
  campuses: Campus[];
  fetchingPrograms: boolean;
  fetchingCampuses: boolean;
  tags: { [position: number]: Tag | null };
  dropdownKey: boolean;
  selectedUniversity: University | null;
  selectedCampus: string;
  getTagsCount: () => number;
  handleUniversityChange: (name: string, id: string) => void;
  handleDelete: (id: string) => void;
  handleReset: () => void;
  handleSubmit: any;
  onSubmit: (data: FilterFormData) => void;
  handleCompare: () => Promise<void>;
  isComparing: boolean;
  isComparisonCompleted: boolean;
  fullWidth?: boolean;
  showPlaceholder?: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}
