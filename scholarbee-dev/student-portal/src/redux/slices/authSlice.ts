import { AuthState } from '@/types/authTypes';
import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },
    setAuth: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
    },
    updateTokens: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    updateProfileStatus: (state) => {
      if (state.user) {
        state.user.isProfileCompleted = true;
        const userCookie = Cookies.get('user');
        if (userCookie) {
          try {
            const parsedUser = JSON.parse(userCookie);
            parsedUser.isProfileCompleted = true;
            // Set user cookie with proper configuration
            const cookieOptions = {
              expires: 7, // 7 days
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict' as const,
              path: '/'
            };
            Cookies.set('user', JSON.stringify(parsedUser), cookieOptions);
          } catch (error) {
            console.error('Error parsing user cookie:', error);
          }
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      // Cookie clearing is now handled by the token manager
    }
  }
});

export const {
  setUser,
  logout,
  setToken,
  setRefreshToken,
  setAuth,
  updateTokens,
  updateProfileStatus
} = authSlice.actions;

export default authSlice.reducer;
