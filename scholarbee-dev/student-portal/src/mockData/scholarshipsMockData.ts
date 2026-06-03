import { Scholarship } from '@/types/scholarship';

export const mockScholarships: Scholarship[] = [
  {
    _id: 'mock-scholarship-1',
    location: 'Boston, MA',
    campus_ids: ['mock-campus-1'],
    rating: 4.5,
    scholarship_name: 'Merit-Based Excellence Scholarship',
    scholarship_description:
      'A prestigious scholarship awarded to outstanding students demonstrating academic excellence and leadership potential.',
    eligibility_criteria:
      'Minimum GPA of 3.5, demonstrated leadership skills, and community involvement.',
    amount: 25000,
    application_deadline: '2024-08-31T23:59:59.000Z',
    scholarship_type: 'Merit-based',
    image_url: '/assets/png/university_placeholder.png',
    organization_id: {
      _id: 'mock-org-1',
      organization_name: 'Academic Excellence Foundation',
      organization_type: 'Non-profit',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      __v: 0
    },
    university_id: {
      _id: 'mock-university-1',
      name: 'Harvard University',
      founded: '1636',
      description: 'A prestigious private research university',
      address_id: 'mock-address-1',
      website: 'https://www.harvard.edu',
      ranking: '2',
      affiliations: 'Ivy League',
      motto: 'Veritas',
      colors: 'Crimson',
      mascot: 'John Harvard',
      type: 'Private',
      total_students: 23000,
      total_faculty: 2400,
      total_alumni: 400000,
      endowment: '$53.2 billion',
      campus_size: '209 acres',
      languages: 'English',
      logo_url: '/assets/png/university_placeholder.png',
      notable_alumni: 'Barack Obama, Mark Zuckerberg',
      created_at: '2024-01-01T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      __v: 0
    },
    country: 'United States',
    region: {
      _id: 'mock-region-1',
      region_name: 'Northeast',
      cities: ['Boston', 'Cambridge'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      __v: 0
    },
    application_link: 'https://example.com/apply',
    application_process:
      'Submit online application, provide transcripts, letters of recommendation, and personal statement.',
    required_documents: [
      { document_name: 'Transcript', id: 'doc-1' },
      { document_name: 'Recommendation Letter', id: 'doc-2' },
      { document_name: 'Personal Statement', id: 'doc-3' }
    ],
    status: 'active',
    created_at: '2024-01-01T00:00:00.000Z',
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    __v: 0,
    favouriteBy: []
  },
  {
    _id: 'mock-scholarship-2',
    location: 'Stanford, CA',
    campus_ids: ['mock-campus-2'],
    rating: 4.8,
    scholarship_name: 'Innovation and Technology Grant',
    scholarship_description:
      'Supporting students pursuing degrees in technology and innovation fields.',
    eligibility_criteria:
      'Enrolled in STEM program, demonstrated innovation projects, financial need.',
    amount: 30000,
    application_deadline: '2024-09-15T23:59:59.000Z',
    scholarship_type: 'Need-based',
    image_url: '/assets/png/university_placeholder.png',
    organization_id: {
      _id: 'mock-org-2',
      organization_name: 'Tech Innovation Fund',
      organization_type: 'Foundation',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      __v: 0
    },
    university_id: {
      _id: 'mock-university-2',
      name: 'Stanford University',
      founded: '1885',
      description: 'A leading research university',
      address_id: 'mock-address-2',
      website: 'https://www.stanford.edu',
      ranking: '3',
      affiliations: 'AAU',
      motto: 'Die Luft der Freiheit weht',
      colors: 'Cardinal Red',
      mascot: 'Tree',
      type: 'Private',
      total_students: 17000,
      total_faculty: 2100,
      total_alumni: 300000,
      endowment: '$37.8 billion',
      campus_size: '8180 acres',
      languages: 'English',
      logo_url: '/assets/png/university_placeholder.png',
      notable_alumni: 'Elon Musk, Larry Page',
      created_at: '2024-01-01T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      __v: 0
    },
    country: 'United States',
    region: {
      _id: 'mock-region-2',
      region_name: 'West Coast',
      cities: ['Stanford', 'Palo Alto'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      __v: 0
    },
    application_link: 'https://example.com/apply',
    application_process:
      'Complete online application, submit portfolio of innovation projects, and financial aid forms.',
    required_documents: [
      { document_name: 'Portfolio', id: 'doc-4' },
      { document_name: 'Financial Aid Form', id: 'doc-5' },
      { document_name: 'Academic Transcript', id: 'doc-6' }
    ],
    status: 'active',
    created_at: '2024-01-01T00:00:00.000Z',
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    __v: 0,
    favouriteBy: []
  },
  {
    _id: 'mock-scholarship-3',
    location: 'Cambridge, MA',
    campus_ids: ['mock-campus-3'],
    rating: 4.7,
    scholarship_name: 'Research Excellence Fellowship',
    scholarship_description:
      'For graduate students conducting groundbreaking research in engineering and sciences.',
    eligibility_criteria:
      'Graduate student, research proposal, minimum GPA of 3.7, publications preferred.',
    amount: 35000,
    application_deadline: '2024-10-01T23:59:59.000Z',
    scholarship_type: 'Research',
    image_url: '/assets/png/university_placeholder.png',
    organization_id: {
      _id: 'mock-org-3',
      organization_name: 'Research Excellence Foundation',
      organization_type: 'Non-profit',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      __v: 0
    },
    university_id: {
      _id: 'mock-university-3',
      name: 'MIT',
      founded: '1861',
      description: 'World-renowned research university',
      address_id: 'mock-address-3',
      website: 'https://www.mit.edu',
      ranking: '1',
      affiliations: 'AAU',
      motto: 'Mens et Manus',
      colors: 'Cardinal Red and Steel Gray',
      mascot: 'Tim the Beaver',
      type: 'Private',
      total_students: 11500,
      total_faculty: 1000,
      total_alumni: 140000,
      endowment: '$27.4 billion',
      campus_size: '168 acres',
      languages: 'English',
      logo_url: '/assets/png/university_placeholder.png',
      notable_alumni: 'Buzz Aldrin, Kofi Annan',
      created_at: '2024-01-01T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      __v: 0
    },
    country: 'United States',
    region: {
      _id: 'mock-region-1',
      region_name: 'Northeast',
      cities: ['Cambridge', 'Boston'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      __v: 0
    },
    application_link: 'https://example.com/apply',
    application_process:
      'Submit research proposal, academic transcripts, publications list, and recommendation letters.',
    required_documents: [
      { document_name: 'Research Proposal', id: 'doc-7' },
      { document_name: 'Publications List', id: 'doc-8' },
      { document_name: 'Recommendation Letters', id: 'doc-9' }
    ],
    status: 'active',
    created_at: '2024-01-01T00:00:00.000Z',
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    __v: 0,
    favouriteBy: []
  }
];

export const mockScholarshipsResponse = {
  data: mockScholarships,
  pagination: {
    totalDocs: 3,
    limit: 10,
    totalPages: 1,
    page: 1
  }
};
