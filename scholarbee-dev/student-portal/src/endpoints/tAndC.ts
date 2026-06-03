import { API_BASE_URL_DEV } from '@/config/config';

export interface LegalDocument {
  _id: string;
  title?: string;
  content?: string;
  type?: string;
  version?: string;
  created_at?: string;
  updatedAt?: string;
  effective_date?: string;
}

export interface LegalDocumentListItem {
  _id: string;
  title?: string;
  document_type: string;
  effective_date?: string;
  version?: number;
  status?: string;
  createdBy?: string;
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export class TermsAndConditionsApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL_DEV;
  }

  private assertAbsoluteBaseUrl(cleanBaseUrl: string): void {
    if (!cleanBaseUrl) {
      throw new Error(
        'NEXT_PUBLIC_API_BASE_URL environment variable is not set. This is required for fetching legal documents.'
      );
    }
    if (
      !cleanBaseUrl.startsWith('http://') &&
      !cleanBaseUrl.startsWith('https://')
    ) {
      throw new Error(
        `Invalid API URL: ${cleanBaseUrl}. NEXT_PUBLIC_API_BASE_URL must be a complete URL (e.g., https://api.example.com)`
      );
    }
  }

  /**
   * GET /legal-documents — e.g. applicable_on=user_registration&status=active
   */
  async listLegalDocuments(params: {
    applicable_on: string;
    status: string;
  }): Promise<LegalDocumentListItem[]> {
    try {
      const cleanBaseUrl = this.baseUrl.replace(/\/$/, '');
      this.assertAbsoluteBaseUrl(cleanBaseUrl);

      const search = new URLSearchParams({
        applicable_on: params.applicable_on,
        status: params.status
      });
      const url = `${cleanBaseUrl}/legal-documents?${search.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        next: {
          revalidate: 3600
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      if (data && Array.isArray(data.docs)) {
        return data.docs;
      }
      return [];
    } catch (error) {
      console.error('Error listing legal documents:', error);
      throw error;
    }
  }

  async getLegalDocument(documentId: string): Promise<LegalDocument> {
    try {
      const cleanBaseUrl = this.baseUrl.replace(/\/$/, '');
      this.assertAbsoluteBaseUrl(cleanBaseUrl);
      const url = `${cleanBaseUrl}/legal-documents/${documentId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        next: {
          revalidate: 3600
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching legal document:', error);
      throw error;
    }
  }
}
