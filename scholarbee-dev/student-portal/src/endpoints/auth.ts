// import { FormData } from '@/app/sign-up/schema';
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RefreshTokenResponse,
  SignUpResponse
} from '@/types/authTypes';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { API_BASE_URL_DEV } from '@/config/config';
// import axiosWithAuth from '@/lib/axiosWithAuth';

export class AuthApi {
  async login(request: LoginRequest) {
    try {
      const response = await axios.post(
        `${API_BASE_URL_DEV}/auth/login`,
        request,
        { timeout: 15000 } // 15s timeout
      );
      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Login successful'
        };
      }
    } catch (error) {
      if (error) {
        return {
          success: false,
          data: (error as AxiosError)?.response?.data,
          message: 'Error While Logging Inn'
        };
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const response = await axios.post<RefreshTokenResponse>(
        `${API_BASE_URL_DEV}/auth/refresh`,
        {}, // Empty body, no refreshToken in the body
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${refreshToken}` // Send as Bearer token
          }
        }
      );

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Token refreshed successfully'
        };
      } else {
        return {
          success: false,
          data: response.data,
          message: `Unexpected status: ${response.status}`
        };
      }
    } catch (error) {
      console.error('Token refresh error:', error);

      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          responseData: error.response?.data,
          message: error.message,
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          requestData: error.config?.data
        });
      }

      return {
        success: false,
        data: (error as AxiosError)?.response?.data || {},
        message: 'Error refreshing token'
      };
    }
  }

  async signUp(request: {
    full_name: string;
    // first_name: string;
    // last_name: string;
    phone_number: string;
    email: string;
    password: string;
  }) {
    try {
      const response: AxiosResponse<SignUpResponse> = await axios.post(
        `${API_BASE_URL_DEV}/auth/signup`,
        request,
        { timeout: 15000 }
      );
      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Verification link  sent to the added email'
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return error.response?.data;
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  }

  async forgotPassword(request: ForgotPasswordRequest) {
    try {
      const response: AxiosResponse<SignUpResponse> = await axios.post(
        `${API_BASE_URL_DEV}/auth/forgot-password`,
        request
      );
      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Password reset link sent to your email'
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return error.response?.data;
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  }

  async verifyEmail(token: string) {
    try {
      const response: AxiosResponse<ForgotPasswordResponse> = await axios.get(
        `${API_BASE_URL_DEV}/auth/verify/${token}`
      );
      return {
        success: true,
        data: response.data,
        message: 'Email verified successfully'
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          data: error.response?.data,
          message: 'Failed to verify email'
        };
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      const response: AxiosResponse<ForgotPasswordResponse> = await axios.post(
        `${API_BASE_URL_DEV}/auth/resend-verification`,
        { email }
      );
      return {
        success: true,
        data: response.data,
        message: 'Verification email sent successfully'
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          data: error?.response?.data,
          message: error?.message || 'Failed to resend verification email'
        };
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  }

  async resendPasswordResetEmail(email: string) {
    try {
      const response: AxiosResponse<ForgotPasswordResponse> = await axios.post(
        `${API_BASE_URL_DEV}/auth/resend-password-reset`,
        { email }
      );
      return {
        success: true,
        data: response.data,
        message: 'Password reset email resent successfully'
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          data: error?.response?.data,
          message: error?.message || 'Failed to resend password reset email'
        };
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  }

  async resetPassword(request: { password: string; token: string }) {
    try {
      const response: AxiosResponse<ForgotPasswordResponse> = await axios.post(
        `${API_BASE_URL_DEV}/auth/reset-password/${request?.token}`,
        { password: request?.password }
      );
      console.log('response on reset password Api', response);
      return {
        success: true,
        data: response.data,
        message: 'Password reset successfully'
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          data: error.response?.data,
          message: 'Failed to reset password'
        };
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  }

  async logout(token: string) {
    try {
      const response = await axios.post(
        `${API_BASE_URL_DEV}/auth/logout`,
        {}, // Empty body
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Logout API response status:', response.status);

      if (response.status === 200 || response.status === 204) {
        return {
          success: true,
          message: 'Logged out successfully'
        };
      } else {
        console.error('Unexpected response status:', response.status);
        return {
          success: false,
          message: `Unexpected status: ${response.status}`
        };
      }
    } catch (error) {
      console.error('Logout error:', error);

      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }

      return {
        success: false,
        message: 'Error logging out'
      };
    }
  }
}
