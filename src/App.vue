<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 헤더: 네비게이션 바 -->
    <q-header elevated class="header">
      <q-toolbar class="q-px-lg q-py-md">
        <q-btn flat round dense class="title" @click="goToHome">LHS</q-btn>
        <q-space />
        <!-- 네비게이션 버튼 -->
        <q-btn flat round dense label="홈" @click="goToHome" />
        <q-btn flat round dense label="게시판" @click="goToBoard" />
        <q-btn v-if="!isAuthenticated" flat round dense label="회원가입" @click="goToRegister" />
        <q-btn v-if="!isAuthenticated" flat round dense label="로그인" @click="goToLogin" />
        <q-btn v-if="isAuthenticated" flat round dense label="로그아웃" @click="logout" />
      </q-toolbar>
    </q-header>

    <!-- 라우터 뷰: 페이지가 여기에 표시됨 -->
    <q-page-container class="q-pa-md">
      <RouterView />
    </q-page-container>

    <!-- 푸터 -->
    <q-footer class="footer">
      <div class="text-center">© 2024 LHS, All Rights Reserved.</div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { computed, onMounted } from 'vue';
import { useAuthStore } from './stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => !!authStore.token);

const goToHome = () => router.push('/');
const goToBoard = () => router.push('/board');
const goToRegister = () => router.push('/register');
const goToLogin = () => router.push('/login');

const logout = () => {
  authStore.logout();
  router.push('/');
};

onMounted(async () => {
  if (authStore.token) {
    await authStore.fetchUser();
  }
});
</script>

<style scoped>
/* Global Styles */
.q-header {
  background-color: #1976d2; /* Modern blue color */
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
  background-color: #fafafa; /* Very light grey background for content */
  padding: 1rem;
  min-height: calc(100vh - 120px); /* Header and footer adjustment */
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* Footer */
.q-footer {
  background-color: #424242; /* Dark grey for footer */
  color: white;
  text-align: center;
  padding: 1rem;
}

/* Post Page Specific Styling */
.board-page {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 1200px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* Soft shadow */
  margin-bottom: 2rem;
}

/* Typography */
.text-h4 {
  color: #333333;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

/* Pagination */
.pagination-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.paging {
  background-color: transparent;
}

/* Post Info */
.post-info-container {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.post-info {
  font-size: 0.875rem;
  color: #666666;
}

/* Buttons and Forms */
.q-btn {
  margin-right: 0.75rem;
}

.q-card {
  width: 100%;
  max-width: 600px;
}

.q-input,
.q-btn {
  margin-top: 0.75rem;
}
</style>
