import { defineStore } from 'pinia';

import { ref } from 'vue';
import { authService } from '@/services/authService.js';
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);

  const isAuthenticated = () => !!user.value;

  const login = async (credentials) => {
    try {
      const response = await authService().login(credentials);
      token.value = response.data.access_token;
      localStorage.setItem('token', token.value);
      await fetchUser();
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      throw error;
    }
  };

  const fetchUser = async () => {
    try {
      user.value = await authService().fetchUser();
    } catch (error) {
      console.error('사용자 정보를 가져오는데 실패했습니다:', error);
      await logout();
    }
  };

  const logout = async () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  };

  return { user, token, login, logout, isAuthenticated, fetchUser };
});
