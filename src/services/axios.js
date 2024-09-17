import axios from 'axios';
import { useAuthStore } from '@/stores/authStore.js';
import router from '@/router/index.js';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  const token = authStore.token;
  // const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//TODO
// 응답 인터셉터 구현하여 공통 에러 처리
// 상단에 게시판 누르면 검색 초기화하고 초기화면으로 돌아가기.
// 토큰 만료 시 에러 코드 401 반환하고 싶음. 그리고 pinia에 있는 token이 유효한지 확인해서 요청 제한하고 싶음.
// 서버 토큰 관련 에러 처리 잘 하고 있나? 만료 시간 줄여보고 401에러 반환하는지 확인.

apiClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response && error.response.status) {
      switch (error.response.status) {
        case 401: {
          console.log(
            '여기 찍히는거 확인함. 에러 처리 공통화 가능할듯하다. try-catch 범벅 없앨 수 있나?'
          );
          // 블록을 추가하여 스코프를 제한
          const authStore = useAuthStore();
          authStore.logout();
          notify('negative', '권한이 없습니다.');
          router.push('/login').catch(() => {});
          // 이행되지 않는 Promise를 반환하여 Promise Chaining 끊어주기
          return new Promise(() => {});
        }
        default:
          return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

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

const notify = (type, message, position = 'top', icon = null) => {
  $q.notify({
    type: type,
    message: message,
    position: position,
    icon: icon
  });
};

export default useAxios;
