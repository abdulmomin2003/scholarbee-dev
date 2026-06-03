import { Program } from './program';

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
}

/** Sign-up API may return the same session payload as login (tokens + user). */
export type SignUpResponse = Partial<LoginResponse> & {
  accessToken?: string;
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface User {
  id: string;
  _id?: string;
  full_name?: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_type: string;
  created_at: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  loginAttempts: number;
  isProfileCompleted?: boolean;
}

export interface LoginResponse {
  exp: number;
  message: string;
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  message: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

export interface AdmissionState {
  campusId: null;
  programs: Program[];
  loading: boolean;
  error: string;
}
