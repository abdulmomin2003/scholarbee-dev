import axios from 'axios';
import { API_BASE_URL_DEV } from '@/config/config';

export class ScholarshipApi {
  private token: string;

  constructor(token?: string | null) {
    this.token = token || '';
  }

  async getScholarship(id: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL_DEV}/scholarships/${id}`,
        {
          headers: {
            Authorization: this.token ? `Bearer ${this.token}` : undefined
          }
        }
      );

      console.log('response===========>', response);

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error fetching scholarship:++++++++++++=', error);
      if (error?.response?.status === 404) {
        throw new Error('Scholarship not found');
      }

      console.error('Error fetching scholarship:', {
        status: error?.response?.status,
        message: error?.response?.data?.message || error.message,
        url: error?.config?.url
      });

      throw new Error('Failed to fetch scholarship details');
    }
  }
}
