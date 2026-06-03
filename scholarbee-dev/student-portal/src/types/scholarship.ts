type Organization = {
  _id: string;
  organization_name: string;
  organization_type: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type University = {
  _id: string;
  name: string;
  founded: string;
  description: string;
  address_id: string;
  website: string;
  ranking: string;
  affiliations: string;
  motto: string;
  colors: string;
  mascot: string;
  type: string;
  total_students: number;
  total_faculty: number;
  total_alumni: number;
  endowment: string;
  campus_size: string;
  languages: string;
  logo_url: string;
  notable_alumni: string;
  created_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type Region = {
  _id: string;
  region_name: string;
  cities: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export interface Scholarship {
  _id: string;
  location: string;
  campus_ids: string[];
  rating: number;
  scholarship_name: string;
  scholarship_description: string;
  eligibility_criteria: string;
  amount: number;
  application_deadline: string; // ISO date format
  scholarship_type: string;
  image_url: string;
  organization_id: Organization;
  university_id: University | string;
  country: string;
  region: Region;
  application_link: string;
  application_process: string;
  required_documents: {
    document_name: string;
    id: string;
  }[];
  status: string;
  created_at: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  favouriteBy: string[];
}
