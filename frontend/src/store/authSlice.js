import { createSlice } from '@reduxjs/toolkit';
const token = localStorage.getItem('token');
const userJson = localStorage.getItem('user');
const initialState = {
  token: token || null,
  user: userJson ? JSON.parse(userJson) : null,
  isAuthenticated: !!token,
  loading: false,
  error: null
};
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateUserRole: (state, action) => {
      if (state.user) {
        state.user.role = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    }
  }
});
export const { authStart, authSuccess, authFailure, logout, updateUserRole } = authSlice.actions;
export default authSlice.reducer;