import { defineStore } from 'pinia';
import authService from '../services/authService';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const userImageUrl = ref(localStorage.getItem('userImageUrl') || '/default-profile.png'); // 기본 이미지 설정

  const isAuthenticated = () => !!token.value;

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      token.value = response.data.access_token;
      localStorage.setItem('token', token.value);
      await fetchUser();
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      token.value = response.data.access_token;
      localStorage.setItem('token', token.value);
      await fetchUser(); // 로그인 후 사용자 정보 가져오기
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      throw error;
    }
  };

  const fetchUser = async () => {
    if (token.value) {
      try {
        const response = await authService.getUser();
        user.value = response.data;
        userImageUrl.value = user.value.memberImageUrl; // Pinia 상태 업데이트
        localStorage.setItem('user', user.value.memberEmail);
        localStorage.setItem('userImageUrl', user.value.memberImageUrl); // 로컬 스토리지 업데이트
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
    localStorage.removeItem('userImageUrl');
    userImageUrl.value = '/default-profile.png'; // 로그아웃 시 기본 이미지로 설정
  };

  return { user, token, isAuthenticated, register, login, fetchUser, logout, userImageUrl };
});
