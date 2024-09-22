import useAxios from './axios';
import { notifyError } from '@/util/notify.js';

export const authService = () => {
  const register = (userData) => {
    try {
      return useAxios({
        type: 'post',
        body: userData,
        url: `auth/register`
      });
    } catch (error) {
      notifyError(error);
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
      notifyError(error);
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
      notifyError(error);
    }
  };
  return { register, login, fetchUser };
};
