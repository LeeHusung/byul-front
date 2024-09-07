import { defineStore } from 'pinia'
import authService from '../services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  actions: {
    async register(userData) {
      const response = await authService.register(userData)
      this.user = response.data.user
      this.token = response.data.token
      localStorage.setItem('token', this.token)
    },
    async login(credentials) {
      const response = await authService.login(credentials)
      this.user = response.data.user
      this.token = response.data.token
      localStorage.setItem('token', this.token)
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    }
  }
})
