import { API_URL_DEV } from '@/constants/config';
import axios, { AxiosError } from 'axios';

export class UtilsApi {
  token: string;
  constructor(token: string) {
    this.token = token;
  }

  async uploadMedia(formData: FormData) {
    try {
      const response = await axios.post(
        `${API_URL_DEV}/media-management`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${this.token}`
          }
        }
      );
      console.log('response on get utils Api', response);

      const responseData: any = response.data;

      // Normalise different backend response shapes to a common one
      // Expected by callers: response.data.doc.filename, response.data.doc.fileUploadUrl
      const fileKey =
        responseData?.doc?.filename ||
        responseData?.data?.fileKey ||
        responseData?.fileKey;
      const fileUploadUrl =
        responseData?.doc?.fileUploadUrl ||
        responseData?.data?.fileUploadUrl ||
        responseData?.fileUploadUrl;

      const normalizedData = {
        ...responseData,
        doc: {
          ...(responseData?.doc || {}),
          filename: fileKey,
          fileUploadUrl: fileUploadUrl || undefined
        }
      };

      if (
        response.status === 200 ||
        response.status === 201 ||
        responseData.status === 'success'
      ) {
        return {
          success: true,
          data: normalizedData,
          message: 'Media uploaded successfully'
        };
      }
    } catch (error) {
      if (error) {
        return {
          success: false,
          data: (error as AxiosError)?.response?.data,
          message: 'Error While Uploading Media'
        };
      }

      throw error;
    }
  }
}
