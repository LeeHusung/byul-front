import apiClient from './axios';

export const authService = () => {
  const register = (userData) => {
    try {
      return apiClient.post('auth/register', userData);
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      throw error;
    }
  };

  const login = (credentials) => {
    try {
      console.log('hihihi');
      return apiClient.post('auth/login', credentials);
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      throw error;
    }
  };

  const fetchUser = () => {
    try {
      return apiClient.get(`member`);
    } catch (error) {
      //유효하지 않은 토큰 요청일 때 추가 처리 필요
      console.error('사용자 정보를 가져오는데 실패했습니다:', error);
      // authStore.logout();
    }
  };
  return { register, login, fetchUser };
};
