<template>
  <div class="login-container">
    <h2>로그인</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="email">이메일</label>
        <input id="email" v-model="email" type="email" required />
      </div>
      <div>
        <label for="password">비밀번호</label>
        <input id="password" v-model="password" type="password" required />
      </div>
      <button type="submit">로그인</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const router = useRouter()

const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:8080/api/v1/auth/login', {
      email: email.value,

      password: password.value
    })
    console.log(response)

    // 로그인 성공 시 홈으로 리다이렉트
    if (response.status === 200) {
      const token = response.data.access_token
      localStorage.setItem('token', token) // 토큰을 로컬 스토리지에 저장
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}` // axios에 기본 Authorization 헤더 추가
      alert('로그인 성공!')
      router.push('/')
    } else {
      console.log('fail')
      errorMessage.value = '로그인 실패: ' + response.data.message
    }
  } catch (error) {
    errorMessage.value = '로그인 실패: 서버 오류'
    console.error(error)
  }
}

// if (localStorage.getItem("token")) {
//   router.push("/");
// }
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f9f9f9;
}

.login-container h2 {
  text-align: center;
  margin-bottom: 20px;
}

.login-container div {
  margin-bottom: 15px;
}

.login-container label {
  display: block;
  margin-bottom: 5px;
}

.login-container input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.login-container button {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.login-container button:hover {
  background-color: #3a9d76;
}

.error {
  color: red;
  text-align: center;
  margin-top: 10px;
}
</style>
