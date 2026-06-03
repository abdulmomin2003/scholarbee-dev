import {
  ApprovedTemplateData,
  RejectedTemplateData,
  UnderReviewTemplateData,
} from '../types/template.types';

/**
 * Utility functions for creating typed template data
 */
export class TemplateDataBuilder {
  /**
   * Create data for under-review template
   */
  static createUnderReviewData(data: {
    applicantName: string;
    userEmail: string;
    programName: string;
    institute: string;
    applicationId: string;
    reviewTimeline?: string;
    dashboardUrl?: string;
  }): UnderReviewTemplateData {
    return {
      applicantName: data.applicantName,
      userEmail: data.userEmail,
      programName: data.programName,
      institute: data.institute,
      applicationId: data.applicationId,
      reviewTimeline: data.reviewTimeline || '2-4 weeks',
      dashboardUrl: data.dashboardUrl,
    };
  }

  /**
   * Create data for approved template
   */
  static createApprovedData(data: {
    applicantName: string;
    userEmail: string;
    programName: string;
    institute: string;
    applicationId: string;
    educationLevel: string;
    dashboardUrl?: string;
  }): ApprovedTemplateData {
    return {
      applicantName: data.applicantName,
      userEmail: data.userEmail,
      programName: data.programName,
      institute: data.institute,
      applicationId: data.applicationId,
      educationLevel: data.educationLevel,
      dashboardUrl: data.dashboardUrl,
    };
  }

  /**
   * Create data for rejected template
   */
  static createRejectedData(data: {
    applicantName: string;
    userEmail: string;
    programName: string;
    institute: string;
    applicationId: string;
    rejectionReason?: string;
    dashboardUrl?: string;
  }): RejectedTemplateData {
    let templateData: RejectedTemplateData = {
      applicantName: data.applicantName,
      userEmail: data.userEmail,
      programName: data.programName,
      institute: data.institute,
      applicationId: data.applicationId,
      dashboardUrl: data.dashboardUrl,
    };

    if (data.rejectionReason) {
      templateData.rejectionReason = data.rejectionReason
    }
    return templateData;
  }
}
