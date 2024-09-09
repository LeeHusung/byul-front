<template>
  <q-page class="q-pa-lg board-page">
    <div class="content-container">
      <div class="text-h4 q-mb-lg text-center" style="color: black">게시판</div>

      <!-- 글 작성 버튼 (모달 트리거) -->
      <q-btn label="글 작성" color="primary" class="q-mb-lg" @click="openDialog" />

      <!-- 게시글 목록 -->
      <q-list bordered class="q-mt-lg">
        <q-item
          v-for="post in posts"
          :key="post.id"
          v-ripple
          clickable
          @click="goToDetail(post.id)"
        >
          <q-item-section>
            <q-item-label class="text-black">{{ post.title }}</q-item-label>
            <q-item-label class="text-black">{{ post.content }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- 페이지네이션 -->
      <div class="pagination-container">
        <q-pagination
          v-model="currentPage"
          bordered
          class="paging"
          :max="totalPages"
          @update:model-value="fetchPosts"
        />
      </div>

      <!-- 글 작성 모달 -->
      <q-dialog v-model="isDialogOpen" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">새 글 작성</div>
          </q-card-section>

          <q-card-section>
            <q-form class="q-gutter-md" @submit.prevent="submitPost">
              <q-input v-model="newPost.title" label="제목" outlined dense required />
              <q-input
                v-model="newPost.content"
                label="내용"
                type="textarea"
                outlined
                dense
                required
              />
              <input type="file" multiple @change="handleFileChange" />
            </q-form>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="취소" color="secondary" @click="closeDialog" />
            <q-btn flat label="작성" color="primary" @click="submitPost" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'
import router from '@/router/index.js'
import response from 'core-js/internals/is-forced.js'

const $q = useQuasar()

// 게시글 목록 변수 및 페이징 관련 변수
const posts = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 10

// 새 글 작성 모달 상태 및 새 글 정보
const isDialogOpen = ref(false)
const newPost = ref({
  title: '',
  content: ''
})
const files = ref([]) // 이미지 파일 배열

// 서버로부터 게시글 불러오기 (페이징 적용)
const fetchPosts = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/v1/board`, {
      params: {
        page: currentPage.value - 1,
        size: pageSize
      }
    })
    console.log(response)
    posts.value = response.data.boardList
    totalPages.value = Math.ceil(response.data.totalCount / pageSize)
  } catch (error) {
    $q.notify({ type: 'negative', message: '게시글을 불러오는데 실패했습니다.' })
  }
}
const goToDetail = (id) => {
  router.push(`/board/${id}`) // 해당 게시글의 ID로 라우팅
}
const handleFileChange = (event) => {
  files.value = event.target.files
}
// 글 작성하기 (모달에서)
// 글 작성하기 (모달에서)
const submitPost = async () => {
  const formData = new FormData()

  // 객체 형태의 boardCreateRequest 생성
  const boardCreateRequest = {
    title: newPost.value.title,
    content: newPost.value.content
  }

  // boardCreateRequest를 JSON 문자열로 변환 후 FormData에 추가
  formData.append(
    'boardCreateRequest',
    new Blob([JSON.stringify(boardCreateRequest)], { type: 'application/json' })
  )

  // 여러 이미지 파일을 formData에 추가
  for (let i = 0; i < files.value.length; i++) {
    formData.append('images', files.value[i])
  }

  const token = localStorage.getItem('token') // 또는 Pinia의 authStore에서 가져오기

  try {
    const response = await axios.post(`http://localhost:8080/api/v1/board`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}` // 토큰 추가
      }
    })
    const createdBoardId = response.data.id // 성공 시 반환된 게시글 ID
    $q.notify({ type: 'positive', message: '글이 성공적으로 작성되었습니다!' })
    router.push(`/board/${createdBoardId}`)
    newPost.value = { title: '', content: '' } // 폼 초기화
    closeDialog() // 모달 닫기
    fetchPosts() // 게시글 목록 갱신
  } catch (error) {
    $q.notify({ type: 'negative', message: '글 작성에 실패했습니다.' })
  }
}

// 모달 열기 및 닫기
const openDialog = () => {
  isDialogOpen.value = true
}

const closeDialog = () => {
  isDialogOpen.value = false
}

// 컴포넌트가 마운트되면 게시글 목록 불러오기
onMounted(fetchPosts)
</script>

<style scoped>
.q-page-container {
  background-color: #f5f5f5; /* 페이지 배경색 */
  min-height: calc(100vh - 60px - 40px); /* 헤더(60px) 및 푸터(40px)를 제외한 높이 설정 */
  display: flex;
  justify-content: center; /* 수평 중앙 정렬 */
  align-items: flex-start; /* 상단 정렬 */
  width: 100%;
}
.text-black {
  color: black; /* 글씨를 검정색으로 설정 */
}
.board-page {
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px); /* 헤더 높이를 제외한 화면 높이 */
  display: flex;
  justify-content: center; /* 중앙 정렬 */
  align-items: flex-start; /* 상단에 정렬 */
  padding-top: 20px;
  width: 100%;
}
.pagination-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.paging {
  background-color: #f5f5f5;
}
.content-container {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 100%; /* 최대 너비를 100%로 설정 */
  width: 100%; /* 가로 너비를 화면 너비에 맞춤 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
