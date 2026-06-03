// Specific data types for different template categories
export interface ApplicationStatusTemplateData {
  applicantName: string;
  programName: string;
  institute: string;
  applicationId: string;
  userEmail: string;
  dashboardUrl?: string;
}

export interface UnderReviewTemplateData extends ApplicationStatusTemplateData {
  reviewTimeline: string;
}

export interface ApprovedTemplateData extends ApplicationStatusTemplateData {
  educationLevel: string;
}

export interface RejectedTemplateData extends ApplicationStatusTemplateData {
  rejectionReason?: string;
}

export interface ChatUnreadMessagesTemplateData {
  adminName: string;    // The admin's first name, e.g. "Ali"
  unreadCount: number;  // Total unread student messages for their campus, e.g. 7
  dashboardUrl: string; // Link to the frontend dashboard, sourced from FRONTEND_URL env var
}

// Template ID enum for better type safety
export enum EmailTemplateId {
  APPLICATION_STATUS_UNDER_REVIEW = 'application-status/under-review',
  APPLICATION_STATUS_APPROVED = 'application-status/approved',
  APPLICATION_STATUS_REJECTED = 'application-status/rejected',
  CHAT_UNREAD_MESSAGES = 'chat/unread-messages',
}

// Template ID to Data Type mapping using enum
export interface TemplateDataMap {
  [EmailTemplateId.APPLICATION_STATUS_UNDER_REVIEW]: UnderReviewTemplateData;
  [EmailTemplateId.APPLICATION_STATUS_APPROVED]: ApprovedTemplateData;
  [EmailTemplateId.APPLICATION_STATUS_REJECTED]: RejectedTemplateData;
  [EmailTemplateId.CHAT_UNREAD_MESSAGES]: ChatUnreadMessagesTemplateData;
}

// Union type of all valid template IDs (now using enum values)
export type TemplateId = keyof TemplateDataMap;

// Helper type to get data type for a template ID
export type TemplateDataForId<T extends TemplateId> = TemplateDataMap[T];

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  variables: string[];
  category: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text?: string;
}
