// src/services/authService.js
import apiClient from './axios'

const authService = {
  register(userData) {
    return apiClient.post('/register', userData)
  },
  login(credentials) {
    return apiClient.post('/login', credentials)
  }
}

export default authService
