// src/services/authService.js
import apiClient from './axios'
import axios from 'axios'
// import axios from 'axios'

const authService = {
  register(userData) {
    // return axios.get(`http://localhost:8080/api/v1/board`);
    return apiClient.post('http://localhost:8080/api/v1/auth/register', userData)
  },
  login(credentials) {
    return apiClient.post('http://localhost:8080/api/v1/auth/login', credentials)
  },
  async getUser() {
    return axios.get(`http://localhost:8080/api/v1/member`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}` // Authorization 헤더에 토큰 추가
      }
    })
  }
}
export default authService
