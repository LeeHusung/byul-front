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
            :rules="[(val) => /.+@.+\..+/.test(val) || '유효한 이메일을 입력하세요']"
            required
          />
          <q-input
            v-model="password"
            label="비밀번호"
            type="password"
            outlined
            dense
            :rules="[(val) => (val && val.length >= 6) || '비밀번호는 최소 6자 이상이어야 합니다']"
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
            v-model="role"
            label="역할"
            outlined
            dense
            :rules="[(val) => !!val || '역할을 입력하세요']"
            required
          />
          <q-input
            v-model="nickname"
            label="닉네임"
            outlined
            dense
            :rules="[(val) => !!val || '닉네임을 입력하세요']"
            required
          />
          <!-- 연락처 입력 -->
          <q-input
            v-model="contact"
            label="연락처"
            outlined
            dense
            :rules="[(val) => /^(010)-\d{3,4}-\d{4}$/.test(val) || '유효한 연락처를 입력하세요']"
            required
          />
          <!-- 성별 선택 -->
          <!--          <q-option-group-->
          <!--            v-model="gender"-->
          <!--            label="성별"-->
          <!--            options="[ { label: '남성', value: 'male' }, { label: '여성', value: 'female' } ]"-->
          <!--            type="radio"-->
          <!--            required-->
          <!--          />-->
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useQuasar } from 'quasar'

// 상태 변수 정의
const email = ref('')
const password = ref('')
const passwordConfirm = ref('') // 비밀번호 확인 필드
const nickname = ref('')
const contact = ref('')
// const name = ref('')
// const gender = ref('MALE') // 기본값은 남성으로 설정
const role = ref('USER')
const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()

// 비밀번호 확인 검증 함수
const validatePasswordConfirm = () => {
  return password.value === passwordConfirm.value || '비밀번호가 일치하지 않습니다'
}

// 회원가입 처리 함수
const onSubmit = async () => {
  if (password.value !== passwordConfirm.value) {
    $q.notify({ type: 'negative', message: '비밀번호가 일치하지 않습니다.' })
    return
  }
  try {
    await authStore.register({
      email: email.value,
      password: password.value,
      // name: name.value,
      nickname: nickname.value,
      contact: contact.value,
      role: role.value
    })
    $q.notify({ type: 'positive', message: '회원가입에 성공했습니다!' })
    await router.push('/')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || '회원가입에 실패했습니다.'
    })
  }
}

// 로그인 페이지로 이동 함수
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
/* 중앙 정렬 및 배경 색상 */
.register-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* 화면 전체 높이 사용 */
  background-color: #f5f5f5; /* 밝은 회색 배경 */
}

.register-card {
  width: 100%;
  max-width: 400px;
  background-color: white; /* 카드 배경은 흰색 */
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1); /* 약간의 그림자 추가 */
}

.full-width {
  width: 100%;
}

.text-center {
  text-align: center;
}
</style>
