<template>
  <q-card :bordered="true">
    <q-card-section>
      <h1>login</h1>
    </q-card-section>
  </q-card>

  <!--  <q-page class="flex flex-center">-->
  <q-card class="q-pa-md" style="width: 400px">
    <q-card-section>
      <div class="text-h6">로그인</div>
    </q-card-section>

    <q-card-section>
      <q-form ref="form" class="q-gutter-md" @submit.prevent="onSubmit">
        <q-input v-model="email" label="이메일" outlined dense />
        <q-input v-model="password" label="비밀번호" type="password" outlined dense />
        <q-btn label="로그인" type="submit" color="primary" />
      </q-form>
    </q-card-section>
  </q-card>
  <!--  </q-page>-->
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'

const email = ref('')
const password = ref('')
const authStore = useAuthStore()

const onSubmit = () => {
  authStore.login({ email: email.value, password: password.value })
}
</script>

<style scoped>
/* 기본 배경색을 흰색으로 설정 */
.q-card {
  background-color: white;
}
</style>
