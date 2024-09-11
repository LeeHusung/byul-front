import { defineStore } from 'pinia';
import authService from '../services/authService';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);

  const isAuthenticated = () => !!token.value;
  const getUserEmail = () => user.value?.memberEmail || '';

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      token.value = response.data.access_token;
      localStorage.setItem('token', token.value);
      await fetchUser(); // Fetch user info after registration
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      throw error; // Propagate error for the caller to handle
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      token.value = response.data.access_token;
      localStorage.setItem('token', token.value);
      await fetchUser();
      return true; // Login successful
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      throw error; // Propagate error for the caller to handle
    }
  };

  const fetchUser = async () => {
    if (token.value) {
      try {
        const response = await authService.getUser();
        user.value = response.data; // Save user info in Pinia state
        localStorage.setItem('user', user.value.memberEmail);
      } catch (error) {
        console.error('사용자 정보를 가져오는데 실패했습니다:', error);
        logout();
      }
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return { user, token, isAuthenticated, getUserEmail, register, login, fetchUser, logout };
});
