// src/services/axios.js
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // 실제 API 주소로 변경하세요.
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient
