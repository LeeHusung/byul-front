<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 헤더: 네비게이션 바 -->
    <q-header elevated>
      <q-toolbar class="q-px-lg q-py-md">
        <q-toolbar-title class="text-h5">LHS</q-toolbar-title>
        <q-space />
        <!-- 네비게이션 버튼 -->
        <q-btn flat round dense label="홈" @click="goToHome" />
        <q-btn flat round dense label="게시판" @click="goToBoard" />
        <q-btn flat round dense label="회원가입" @click="goToRegister" />
        <q-btn v-if="!isAuthenticated" flat round dense label="로그인" @click="goToLogin" />
        <q-btn v-if="isAuthenticated" flat round dense label="로그아웃" @click="logout" />
      </q-toolbar>
    </q-header>

    <!-- 라우터 뷰: 페이지가 여기에 표시됨 -->
    <q-page-container class="q-pa-md">
      <RouterView />
    </q-page-container>

    <!-- 푸터 -->
    <q-footer class="bg-grey-9 text-white q-py-md">
      <div class="text-center">© 2024 LHS, All Rights Reserved.</div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from './stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// 로그인 여부를 computed로 가져와서 반영
const isAuthenticated = computed(() => authStore.isAuthenticated)

const goToHome = () => router.push('/')
const goToBoard = () => router.push('/board')
const goToRegister = () => router.push('/register')
const goToLogin = () => router.push('/login')

const logout = () => {
  authStore.logout()
  router.push('/') // 로그아웃 후 홈으로 이동
}

// 앱이 로드될 때 토큰이 있으면 getUser() 호출
onMounted(async () => {
  if (authStore.token) {
    await authStore.fetchUser() // 사용자 정보 가져오기
  }
})
</script>

<style scoped>
.q-header {
  background-color: #1e88e5; /* 네비게이션 바 색상: 파란색 */
  color: white;
}

.q-toolbar-title {
  font-weight: bold;
}

.q-btn {
  color: white;
  font-weight: 500;
  text-transform: uppercase;
}

.q-page-container {
  background-color: #f5f5f5; /* 페이지 배경: 밝은 회색 */
  min-height: calc(100vh - 60px); /* 헤더 및 푸터를 제외한 높이 */
}

.q-footer {
  background-color: #424242; /* 푸터 배경색: 짙은 회색 */
  color: white;
}
</style>
