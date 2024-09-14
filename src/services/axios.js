import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//TODO
// 응답 인터셉터 구현하여 공통 에러 처리

// 커스텀 Axios 함수
const useAxios = ({ type = 'get', param = '', body = {}, header = {}, params = {} }) => {
  switch (type.toLowerCase()) {
    case 'post':
      return apiClient.post(param, body, { headers: header });
    case 'get':
      return apiClient.get(param, { headers: header, params: params });
    case 'put':
      return apiClient.put(param, body, { headers: header });
    case 'delete':
      return apiClient.delete(param, { headers: header });
    default:
      throw new Error('올바르지 않은 요청 타입입니다.');
  }
};

export default useAxios;
