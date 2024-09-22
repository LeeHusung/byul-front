<template>
  <q-layout view="lHh Lpr lFf">
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
        <q-btn v-if="isAuthenticated" flat round dense label="로그아웃" @click="confirmLogout" />
      </q-toolbar>
    </q-header>

    <!-- 라우터 뷰: 페이지가 여기에 표시됨 -->
    <q-page-container class="q-pa-md">
      <!--      :key="$route.fullPath"를 사용하면 vue는 route.fullPath의 값이 바뀔 때마다 RouterView를-->
      <!--      강제로 다시 렌더링한다. 근데 이 방법은 spa의 장점을 잃어버리는 듯. 쿼리 파라미터 변경시마다 리로딩하여서 페이지 끊김 발생함. 대안은? -->
      <RouterView :key="routerKey" />
    </q-page-container>

    <q-footer class="footer">
      <div class="text-center">© 2024 LHS, All Rights Reserved.</div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from './stores/authStore';
const routerKey = ref(0);
const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.user != null);
const goToHome = () => router.push('/');
const goToBoard = () => {
  sessionStorage.removeItem('searchOption');
  sessionStorage.removeItem('searchQuery');
  sessionStorage.removeItem('currentPage');
  routerKey.value += 1;
  router.push('/board');
};
const goToRegister = () => router.push('/register');
const goToLogin = () => router.push('/login');
const goToMine = () => {
  router.push('/my');
};

const confirmLogout = async () => {
  const userConfirmed = window.confirm('로그아웃 하시겠습니까?');
  if (userConfirmed) {
    await logout();
  }
};
const logout = async () => {
  await authStore.logout();
  await router.push('/');
};

onMounted(async () => {
  // if (authStore.token) {
  //   await authService().fetchUser();
  // }
});
</script>

<style scoped>
.title {
  font-size: 1.5rem;
  font-weight: bold;
}

.q-footer div {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
