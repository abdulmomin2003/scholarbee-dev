export const DB_COLLECTIONS = {
  // Users
  USERS: 'users',
  // Notifications
  NOTIFICATIONS: 'notifications',
  NOTIFICATION_READ_RECEIPTS: 'notification_read_receipts',
  // Reference System
  REFERRALS: 'referrals',
  REFERRAL_USAGES: 'referral_usages',
  // Legal Documents
  LEGAL_DOCUMENT_CATEGORIES: 'legal_document_categories',
  LEGAL_DOCUMENT_REQUIREMENTS: 'legal_document_requirements',
  LEGAL_DOCUMENT_SCOPES: 'legal_document_scopes',
  LEGAL_DOCUMENTS: 'legal_documents',
  // Fee Structures
  FEE_STRUCTURES: 'fee_structures',
  // Admission Programs
  ADMISSION_PROGRAMS: 'admission_programs',
  ADMISSIONS: 'admissions',
  // Universities
  UNIVERSITIES: 'universities',
  // Campuses
  CAMPUSES: 'campuses',
  // Addresses
  ADDRESSES: 'addresses',
  // Programs
  PROGRAMS: 'programs',
  // Program Templates
  PROGRAM_TEMPLATES: 'program_templates',
  // Academic Departments
  ACADEMIC_DEPARTMENTS: 'academic_departments',
  // Scholarships
  SCHOLARSHIPS: 'scholarships',
  STUDENT_SCHOLARSHIPS: 'student_scholarships',
  // Applications
  APPLICATIONS: 'applications',
  // External Applications
  EXTERNAL_APPLICATIONS: 'external_applications',
  // Chat
  MESSAGES: 'messages',
  // AI chatbot (BeeBot) — distinct from human messaging chat
  CHATBOT_CONVERSATIONS: 'chatbot_conversations',
  // Recommendation System
  USER_EVENTS: 'user_events',
} as const;
