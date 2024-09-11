<template>
  <div class="login-page q-pa-lg flex flex-center">
    <q-card class="q-pa-lg login-card">
      <q-card-section>
        <div class="text-h5 text-center q-mb-md">로그인</div>
      </q-card-section>

      <q-card-section>
        <q-form ref="form" class="q-gutter-md" @submit.prevent="onSubmit">
          <q-input
            v-model="email"
            label="이메일"
            outlined
            dense
            :rules="[emailRule]"
            :error="!!emailError"
            :error-message="emailError"
          />
          <q-input
            v-model="password"
            label="비밀번호"
            type="password"
            outlined
            dense
            :rules="[passwordRule]"
            :error="!!passwordError"
            :error-message="passwordError"
          />
          <q-btn label="로그인" type="submit" color="primary" class="full-width q-mt-md" />
        </q-form>
      </q-card-section>

      <!-- 회원가입 버튼 -->
      <q-card-actions align="center" class="q-mt-md">
        <q-btn flat label="회원가입" color="secondary" @click="navigateToSignUp" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import router from '@/router/index.js';
import { useQuasar } from 'quasar';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const $q = useQuasar();

const emailError = ref('');
const passwordError = ref('');

// Email validation rule using a regular expression
const emailRule = (val) =>
  !!val.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) || '유효한 이메일 주소를 입력하세요.';

// Password validation rule to check both required and length >= 8
const passwordRule = (val) =>
  (!!val && val.length >= 8) || '비밀번호는 최소 8자 이상이어야 합니다.';

const validateForm = () => {
  // Reset errors
  emailError.value = '';
  passwordError.value = '';

  // Check email format
  if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    emailError.value = '유효한 이메일 주소를 입력하세요.';
    return false;
  }

  // Check if password is entered and has at least 8 characters
  if (!password.value || password.value.length < 8) {
    passwordError.value = '비밀번호는 최소 8자 이상이어야 합니다.';
    return false;
  }

  return true;
};

const onSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    await authStore.login({ email: email.value, password: password.value });
    $q.notify({ type: 'positive', message: '로그인에 성공했습니다!' });
    await router.push('/'); // Navigate to homepage after login
  } catch (error) {
    const errorMessage = error.response?.data?.message || '로그인에 실패했습니다.';
    console.log(error);
    $q.notify({
      type: 'negative',
      message: errorMessage
    });
  }
};

// 회원가입 페이지로 이동하는 함수
const navigateToSignUp = () => {
  router.push('/register');
};
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 400px;
  background-color: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.text-h5 {
  font-weight: 600;
}

.full-width {
  width: 100%;
}

.q-btn {
  font-weight: 500;
}
</style>
