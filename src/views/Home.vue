<template>
  <q-page class="q-pa-lg home-page">
    <div class="content-container">
      <div class="text-h4 q-mb-lg text-center">Welcome to LHS Portal</div>
      <div class="button-container q-my-md">
        <q-btn label="게시판" color="primary" class="q-mb-md full-width" @click="goToBoard" />
        <q-btn
          v-if="isAuthenticated"
          label="마이페이지"
          color="primary"
          class="q-mb-md full-width"
          @click="goToMine"
        />
        <q-btn
          v-if="!isAuthenticated"
          label="회원가입"
          color="secondary"
          class="q-mb-md full-width"
          @click="goToRegister"
        />
        <q-btn
          v-if="!isAuthenticated"
          label="로그인"
          color="secondary"
          class="full-width"
          @click="goToLogin"
        />
      </div>

      <div class="description text-center">
        <p>회원가입 후, 게시판을 통해 다양한 정보를 확인하세요.</p>
        <p>로그인을 통해 더 많은 기능을 이용할 수 있습니다.</p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';
const router = useRouter();

const goToRegister = () => {
  router.push('/register');
};

const goToLogin = () => {
  router.push('/login');
};

const goToBoard = () => {
  router.push('/board');
};
const goToMine = () => {
  router.push('/my');
};

const isAuthenticated = computed(() => authStore.user != null);

const authStore = useAuthStore();
</script>

<style scoped>
/* 메인 페이지 스타일 */
.home-page {
  background-color: #f5f5f5; /* 페이지 배경색 */
  min-height: 100vh; /* 화면 전체 채우기 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-container {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.text-center {
  color: black;
  text-align: center;
}

.button-container {
  display: flex;
  flex-direction: column;
}

.full-width {
  width: 100%;
}
</style>
