export interface Application {
  id: string;
  status: string;
  program?: {
    name: string;
    _id: string;
  };
  program_id?: {
    name: string;
    _id: string;
  };
  submission_date: string;
  admission_program_id?:
    | {
        _id: string;
        program_name?: string;
        name?: string;
      }
    | string;
}

export interface SidebarItem {
  icon: string;
  text: string;
  active: boolean;
  onClick: () => void;
  isLoading?: boolean;
}

export interface Scholarship {
  id: string;
  approval_status: string;
  scholarship_id: {
    scholarship_name: string;
    _id: string;
  };
  created_at: string;
}

export interface ApplicationListProps {
  applications: Application[] | Scholarship[];
  isLoading: boolean;
  isScholarship?: boolean;
}
