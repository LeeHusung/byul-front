<template>
  <div class="signup-container">
    <h2>회원가입</h2>
    <form @submit.prevent="handleSignup">
      <div>
        <label for="email">이메일</label>
        <input id="email" v-model="email" type="email" required />
      </div>
      <div>
        <label for="nickname">닉네임</label>
        <input id="nickname" v-model="nickname" type="text" required />
      </div>
      <div>
        <label for="password">비밀번호</label>
        <input id="password" v-model="password" type="password" required />
      </div>
      <div>
        <label for="passwordConfirm">비밀번호확인</label>
        <input id="passwordConfirm" v-model="passwordConfirm" type="password" required />
      </div>
      <div>
        <label for="contact">연락처</label>
        <input id="contact" v-model="contact" type="text" required />
      </div>
      <div>
        <label for="role">역할</label>
        <input id="role" v-model="role" type="text" required />
      </div>
      <button type="submit">회원가입</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import axios from 'axios'
import router from '@/router'
import response from 'core-js/internals/is-forced'

const email = ref('')
const nickname = ref('')
const password = ref('')
const passwordConfirm = ref('')
const contact = ref('')
const role = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const handleSignup = async () => {
  try {
    const response = await axios.post('http://localhost:8080/api/v1/auth/register', {
      email: email.value,
      nickname: nickname.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
      contact: contact.value,
      role: role.value
    })
    console.log(response)
    // 성공 메시지 처리
    if (response.status === 201) {
      successMessage.value = '회원가입이 성공적으로 완료되었습니다.'
      errorMessage.value = ''
      alert('회원가입 성공')
      router.push('/login')
    } else {
      errorMessage.value = response.data.message
      successMessage.value = ''
    }
  } catch (error) {
    errorMessage.value = response.data.message //왜 message가 안나오고 공백이 나오지? 성공해서 나옴. 밑에 successMessage가 나와. 왜?
    successMessage.value = 'dasfasd'
    console.error(error)
  }
}
</script>

<style scoped>
.signup-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f9f9f9;
}

.signup-container h2 {
  text-align: center;
  margin-bottom: 20px;
}

.signup-container div {
  margin-bottom: 15px;
}

.signup-container label {
  display: block;
  margin-bottom: 5px;
}

.signup-container input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.signup-container button {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.signup-container button:hover {
  background-color: #3a9d76;
}

.error {
  color: red;
  text-align: center;
  margin-top: 10px;
}

.success {
  color: green;
  text-align: center;
  margin-top: 10px;
}
</style>
