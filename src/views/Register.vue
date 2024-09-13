<template>
  <div class="register-layout">
    <q-card class="q-pa-md register-card">
      <q-card-section>
        <div class="text-h6" style="color: black">회원가입</div>
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="onSubmit">
          <q-input
            v-model="email"
            label="이메일"
            outlined
            dense
            autocomplete="off"
            :rules="emailRules"
            :error="!!emailError"
            :error-message="emailError"
            required
            @blur="checkEmail"
          />

          <q-input
            v-model="password"
            label="비밀번호"
            type="password"
            outlined
            dense
            autocomplete="new-password"
            :rules="[(val) => (val && val.length >= 8) || '비밀번호는 최소 8자 이상이어야 합니다']"
            required
          />
          <q-input
            v-model="passwordConfirm"
            label="비밀번호 확인"
            type="password"
            outlined
            dense
            :rules="[(val) => !!val || '비밀번호 확인을 입력하세요', validatePasswordConfirm]"
            required
          />
          <q-input
            v-model="nickname"
            label="닉네임"
            outlined
            dense
            :rules="[nicknameRules]"
            :error="!!nicknameError"
            :error-message="nicknameError"
            @blur="checkNickname"
          />
          <q-input
            v-model="contact"
            label="연락처"
            outlined
            dense
            placeholder="010-0000-0000"
            :rules="[(val) => /^(010)-\d{3,4}-\d{4}$/.test(val) || '유효한 연락처를 입력하세요']"
            required
          />
          <q-btn label="회원가입" type="submit" color="primary" class="full-width" />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center" style="color: black">
        <span>이미 계정이 있으신가요?</span>
        <q-btn flat label="로그인" @click="goToLogin" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// import { useAuthStore } from '@/stores/authStore';
import { useQuasar } from 'quasar';
import axios from 'axios';
import { authService } from '@/services/authService.js';
// import authService from '@/services/authService.js';

const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const nickname = ref('');
const contact = ref('');
const role = ref('USER');
// const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();
const nicknameError = ref(''); // 닉네임 검증 오류 메시지
const emailError = ref('');

const emailRules = [
  (val) => !!val || '이메일을 입력하세요',
  (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || '유효한 이메일을 입력하세요',
  () => !emailError.value || emailError.value
];

// 이메일 중복 검증 함수
const checkEmail = async () => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/v1/member/check-email?email=${email.value}`
    );
    if (response.data === true) {
      emailError.value = '이미 사용 중인 이메일입니다.';
    } else {
      emailError.value = ''; // 중복이 아니면 오류 메시지 초기화
    }
  } catch (error) {
    notify('negative', error.response?.data?.message || '이메일 검증 중 오류가 발생했습니다.');
  }
};
// 닉네임 중복 검증 함수
const checkNickname = async () => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/v1/member/check-nickname?nickname=${nickname.value}`
    );
    if (response.data === true) {
      nicknameError.value = '이미 사용 중인 닉네임입니다.';
    } else {
      nicknameError.value = ''; // 중복이 아니면 오류 메시지 초기화
    }
  } catch (error) {
    notify('negative', error.response?.data?.message || '닉네임 검증 중 오류가 발생했습니다.');
  }
};

// 닉네임 검증 룰
const nicknameRules = [
  (val) => !!val || '닉네임을 입력하세요',
  () => !nicknameError.value || nicknameError.value
];

// 비밀번호 확인 검증 함수
const validatePasswordConfirm = () => {
  return password.value === passwordConfirm.value || '비밀번호가 일치하지 않습니다';
};

const onSubmit = async () => {
  if (password.value !== passwordConfirm.value) {
    notify('negative', '비밀번호가 일치하지 않습니다.');
    return;
  }
  if (nicknameError.value || emailError.value) {
    notify('negative', '유효한 정보를 입력해주세요.');
    return;
  }
  try {
    await authService().register({
      email: email.value,
      password: password.value,
      nickname: nickname.value,
      contact: contact.value,
      role: role.value
    });
    notify('positive', '회원가입에 성공했습니다!');
    await router.push('/');
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      const errorMessages = error.response.data.errors.map((err) => `${err.field}: ${err.reason}`);
      notify('negative', `회원가입 중 오류 발생: ${errorMessages.join(', ')}`);
    } else {
      notify('negative', error.response?.data?.message || '회원가입에 실패했습니다.');
    }
    throw error;
  }
};

const notify = (type, message, position = 'top', icon = null) => {
  $q.notify({
    type: type,
    message: message,
    position: position,
    icon: icon
  });
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.register-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.register-card {
  width: 100%;
  max-width: 400px;
  background-color: white;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

.full-width {
  width: 100%;
}

.text-center {
  text-align: center;
}
</style>
