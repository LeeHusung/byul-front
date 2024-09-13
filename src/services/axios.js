import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080/api/v1/';
if (localStorage.getItem('token')) {
  axios.defaults.headers.common = { Authorization: `Bearer ${localStorage.getItem('token')}` };
}
const apiClient = axios.create({
  // baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});
//
// apiClient.interceptors.request.use(
//   function (config) {
//     const token = localStorage.getItem('token');
//
//     //요청시 AccessToken 계속 보내주기
//     if (!token) {
//       config.headers.accessToken = null;
//       console.log('haha');
//       // config.headers.refreshToken = null;
//       return config;
//     }
//
//     if (config.headers && token) {
//       const { accessToken } = JSON.parse(token);
//       console.log(accessToken);
//       config.headers.authorization = `Bearer ${accessToken}`;
//       // config.headers.refreshToken = `Bearer ${refreshToken}`;
//       return config;
//     }
//     // Do something before request is sent
//     console.log('request start', config);
//   },
//   function (error) {
//     // Do something with request error
//     console.log('request error', error);
//     return Promise.reject(error);
//   }
// );
//
// apiClient.interceptors.response.use(
//   function (response) {
//     // Any status code that lie within the range of 2xx cause this function to trigger
//     // Do something with response data
//     console.log('get response', response);
//     return response;
//   },
//   async (error) => {
//     const {
//       config,
//       response: { status }
//     } = error;
//     if (status === 401) {
//       if (error.response.data.message === 'expired') {
//         const originalRequest = config;
//         // const refreshToken = await localStorage.getItem('refreshToken');
//         // token refresh 요청
//         // const { data } = await axios.post(
//         //   `http://localhost:3000/refreshToken`, // token refresh api
//         //   {},
//         //   { headers: { authorization: `Bearer ${refreshToken}` } }
//         // );
//         // 새로운 토큰 저장
//         // dispatch(userSlice.actions.setAccessToken(data.data.accessToken)); store에 저장
//         const { accessToken: newAccessToken, refreshToken: newRefreshToken } = null;
//         await localStorage.multiSet([
//           ['accessToken', newAccessToken],
//           ['refreshToken', newRefreshToken]
//         ]);
//         originalRequest.headers.authorization = `Bearer ${newAccessToken}`;
//         // 401로 요청 실패했던 요청 새로운 accessToken으로 재요청
//         return axios(originalRequest);
//       }
//     }
//     // Any status codes that falls outside the range of 2xx cause this function to trigger
//     // Do something with response error
//     console.log('response error', error);
//     return Promise.reject(error);
//   }
// );

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// instance.interceptors.request.use(
//   (config) => {
//     const accessToken = getAccessToken();
//
//     if (!accessToken) {
//       window.location.href = '/login';
//       return config;
//     }
//
//     config.headers['Content-Type'] = 'application/json';
//     config.headers['Authorization'] = `Bearer ${accessToken}`;
//
//     return config;
//   },
//   (error: any) => {
//     console.log(error);
//     return Promise.reject(error);
//   },
// );

// apiClient.interceptors.response.use(
//   async function (response) {
//     return response;
//   },
//   async function (error) {
//     const {
//       config,
//       response: { status }
//     } = error;
//
//     if (status === 401 && data.message === 'InvalidTokenException') {
//       // 토큰이 없거나 잘못되었을 경우
//       // logout();
//     }
//     if (status === 401 && data.message === 'TokenExpired') {
//       try {
//         const tokenRefreshResult = await instance.post('/refresh-token');
//         if (tokenRefreshResult.status === 200) {
//           const { accessToken, refreshToken } = tokenRefreshResult.data;
//           // 새로 발급받은 토큰을 스토리지에 저장
//           localStorage.setItem('accessToken', accessToken);
//           localStorage.setItem('refreshToken', refreshToken);
//           // 토큰 갱신 성공. API 재요청
//           return instance(config);
//         } else {
//           logout();
//         }
//       } catch (e) {
//         logout();
//       }
//     }
//
//     return Promise.reject(error);
//   }
// );
// const useAxios = ({ type, param, body, header }) => {
//   'post', 'get';
//   apiClient.post();
// };

export default apiClient;
