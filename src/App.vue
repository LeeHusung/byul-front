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
        <q-btn v-if="isAuthenticated" flat round dense label="마이페이지" @click="goToMine" />
        <q-btn v-if="!isAuthenticated" flat round dense label="회원가입" @click="goToRegister" />
        <q-btn v-if="!isAuthenticated" flat round dense label="로그인" @click="goToLogin" />
        <!--        <img-->
        <!--          v-if="isAuthenticated"-->
        <!--          :src="profileImageUrl"-->
        <!--          alt="프로필 이미지"-->
        <!--          class="profile-image-nav"-->
        <!--        />-->

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
const goToMine = () => {
  router.push('/my');
};
const logout = () => {
  authStore.logout();
  // 상단바의 프로필 이미지가 기본 이미지로 즉시 변경되도록 설정
  profileImageUrl.value = '/default-profile.png';
  router.push('/');
};

const userImageUrl = computed(() => localStorage.getItem('userImageUrl'));
const profileImageUrl = computed(() => {
  // Pinia에 저장된 memberImageUrl이 파일 이름일 경우, 이를 이미지 API 경로로 변환
  console.log(userImageUrl);
  return userImageUrl.value
    ? `http://localhost:8080/api/v1/member/image/${userImageUrl.value}`
    : '/default-profile.png'; // 기본 이미지 경로
});

onMounted(async () => {
  if (authStore.token) {
    await authStore.fetchUser();
  }
});
</script>

<style scoped>
/* Header Styles */
.q-header {
  background-color: #1976d2; /* Modern blue color */
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.q-toolbar {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.q-btn {
  color: white;
  font-weight: 500;
  text-transform: uppercase;
  padding: 8px 16px;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
}

.profile-image-nav {
  width: 40px;
  height: 40px;
  border-radius: 50%; /* 원형 이미지 */
  object-fit: cover; /* 이미지 비율 유지 */
  margin-left: 8px;
  border: 2px solid white; /* 이미지 테두리 */
}

/* Page Container Styles */
.q-page-container {
  background-color: #fafafa;
  padding: 1rem;
  min-height: calc(100vh - 160px); /* Header와 Footer를 고려한 높이 */
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.content-wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* Footer Styles */
.q-footer {
  background-color: #424242;
  color: white;
  text-align: center;
  padding: 1rem;
  font-size: 0.875rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.q-footer div {
  max-width: 1200px;
  margin: 0 auto;
}

/* Post Page Styling */
.board-page {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 1200px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Typography */
.text-h4 {
  color: #333333;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.75rem;
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

/* Responsive Styles */
@media (max-width: 768px) {
  .q-header,
  .q-footer {
    padding: 0 1rem;
  }

  .q-btn {
    font-size: 0.875rem;
  }

  .profile-image-nav {
    width: 30px;
    height: 30px;
  }

  .q-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .q-page-container {
    padding: 0.5rem;
  }
}
</style>
