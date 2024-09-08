<template>
  <q-page class="q-pa-lg board-page">
    <div class="content-container">
      <div class="text-h4 q-mb-lg text-center" style="color: black">게시판</div>

      <!-- 글 작성 버튼 (모달 트리거) -->
      <q-btn label="글 작성" color="primary" class="q-mb-lg" @click="openDialog" />

      <!-- 게시글 목록 -->
      <q-list bordered class="q-mt-lg">
        <q-item v-for="post in posts" :key="post.id" v-ripple clickable>
          <q-item-section>
            <q-item-label class="text-black">{{ post.title }}</q-item-label>
            <q-item-label class="text-black">{{ post.content }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- 페이지네이션 -->
      <q-pagination
        v-model="currentPage"
        bordered
        class="paging"
        :max="totalPages"
        @update:model-value="fetchPosts"
      />

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

// 서버로부터 게시글 불러오기 (페이징 적용)
const fetchPosts = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/v1/board`, {
      params: {
        page: currentPage.value - 1,
        size: pageSize
      }
    })

    posts.value = response.data.boardList
    totalPages.value = Math.ceil(response.data.totalItems / pageSize)
  } catch (error) {
    $q.notify({ type: 'negative', message: '게시글을 불러오는데 실패했습니다.' })
  }
}

// 글 작성하기 (모달에서)
const submitPost = async () => {
  try {
    await axios.post(`/api/v1/board`, newPost.value)
    $q.notify({ type: 'positive', message: '글이 성공적으로 작성되었습니다!' })
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
.paging {
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px); /* 헤더 높이를 제외한 화면 높이 */
  display: flex;
  justify-content: center; /* 중앙 정렬 */
  align-items: flex-start; /* 상단에 정렬 */
  padding-top: 20px;
  width: 100%;
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
