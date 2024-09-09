import { defineStore } from 'pinia'
import authService from '../services/authService'

// setup 으로 바꾸기
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
      try {
        const response = await authService.register(userData)
        this.token = response.data.access_token
        localStorage.setItem('token', this.token)
        await this.fetchUser() // 사용자 정보 가져오기
      } catch (error) {
        console.error('회원가입 중 오류 발생:', error)
      }
    },
    async login(credentials) {
      try {
        const response = await authService.login(credentials)
        this.token = response.data.access_token
        localStorage.setItem('token', this.token)

        await this.fetchUser()
      } catch (error) {
        console.error('로그인 중 오류 발생:', error)
      }
    },
    async fetchUser() {
      if (this.token) {
        try {
          const response = await authService.getUser()
          this.user = response.data // user 정보를 Pinia 상태에 저장
        } catch (error) {
          console.error('사용자 정보를 가져오는데 실패했습니다:', error)
          this.logout()
        }
      }
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    }
  }
})
