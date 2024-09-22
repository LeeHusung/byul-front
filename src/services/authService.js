import useAxios from './axios';

export const authService = () => {
  const register = (userData) => {
    try {
      return useAxios({
        type: 'post',
        body: userData,
        url: `auth/register`
      });
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      throw error;
    }
  };

  const login = (credentials) => {
    try {
      return useAxios({
        type: 'post',
        body: credentials,
        url: `auth/login`
      });
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      throw error;
    }
  };

  const fetchUser = () => {
    try {
      return useAxios({
        type: 'get',
        url: `member`
      });
    } catch (error) {
      console.error('사용자 정보를 가져오는데 실패했습니다:', error);
    }
  };
  return { register, login, fetchUser };
};
