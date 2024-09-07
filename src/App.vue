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
        <q-btn flat round dense label="로그인" @click="goToLogin" />
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
const router = useRouter()

const goToHome = () => router.push('/')
const goToBoard = () => router.push('/board') // 게시판 페이지로 이동하는 함수
const goToRegister = () => router.push('/register')
const goToLogin = () => router.push('/login')
</script>

<style scoped>
/* 헤더와 버튼 스타일 */
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

/* 페이지 레이아웃 패딩 및 정렬 */
.q-page-container {
  background-color: #f5f5f5; /* 페이지 배경: 밝은 회색 */
  min-height: calc(100vh - 60px); /* 헤더 및 푸터를 제외한 높이 */
}

/* 푸터 스타일 */
.q-footer {
  background-color: #424242; /* 푸터 배경색: 짙은 회색 */
  color: white;
}
</style>
