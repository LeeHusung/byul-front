<template>
  <q-page class="q-pa-lg board-page">
    <div class="content-container">
      <div class="text-h4 q-mb-lg text-center" style="color: black">{{ post.title }}</div>
      <div class="q-mb-lg text-right">
        <!-- 수정 및 삭제 버튼 -->
        <q-btn label="수정" color="primary" class="q-mr-sm" @click="editPost" />
        <q-btn label="삭제" color="negative" @click="deletePost" />
      </div>

      <!-- 게시글 내용 -->
      <q-card bordered class="q-mb-lg">
        <q-card-section>
          <q-item-label class="text-black">{{ post.content }}</q-item-label>
          <!--          <q-item-label caption class="text-grey">{{ post.createdAt | formatDate }}</q-item-label>-->
        </q-card-section>
      </q-card>

      <!-- 글 수정 모달 -->
      <q-dialog v-model="isEditDialogOpen" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">글 수정</div>
          </q-card-section>

          <q-card-section>
            <q-form class="q-gutter-md" @submit.prevent="submitEdit">
              <q-input v-model="editedPost.title" label="제목" outlined dense required />
              <q-input
                v-model="editedPost.content"
                label="내용"
                type="textarea"
                outlined
                dense
                required
              />
            </q-form>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="취소" color="secondary" @click="closeEditDialog" />
            <q-btn flat label="수정" color="primary" @click="submitEdit" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

// 게시글 상세 정보 및 수정 모달 상태 변수
const post = ref({})
const isEditDialogOpen = ref(false)
const editedPost = ref({
  title: '',
  content: ''
})

// 게시글 ID 추출 (라우트에서 가져옴)
const postId = route.params.id

// 게시글 상세 정보 불러오기
const fetchPostDetail = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/v1/board/${postId}`)
    post.value = response.data
  } catch (error) {
    $q.notify({ type: 'negative', message: '게시글을 불러오는데 실패했습니다.' })
  }
}

// 게시글 수정 모달 열기
const editPost = () => {
  editedPost.value = { ...post.value }
  isEditDialogOpen.value = true
}

// 게시글 수정 제출
const submitEdit = async () => {
  try {
    await axios.put(`http://localhost:8080/api/v1/board/${postId}`, editedPost.value)
    $q.notify({ type: 'positive', message: '글이 성공적으로 수정되었습니다!' })
    isEditDialogOpen.value = false
    fetchPostDetail() // 수정 후 다시 게시글 상세 정보를 불러옴
  } catch (error) {
    $q.notify({ type: 'negative', message: '글 수정에 실패했습니다.' })
  }
}

// 게시글 삭제
const deletePost = async () => {
  try {
    await axios.delete(`http://localhost:8080/api/v1/board/${postId}`)
    $q.notify({ type: 'positive', message: '글이 성공적으로 삭제되었습니다!' })
    router.push('/board') // 삭제 후 게시판 목록으로 이동
  } catch (error) {
    $q.notify({ type: 'negative', message: '글 삭제에 실패했습니다.' })
  }
}

// 수정 모달 닫기
const closeEditDialog = () => {
  isEditDialogOpen.value = false
}

// 게시글 상세 정보 불러오기 (컴포넌트가 마운트되면)
onMounted(fetchPostDetail)

// 날짜 포맷 필터
// const formatDate = (value) => {
//   const options = { year: 'numeric', month: 'short', day: 'numeric' }
//   return new Date(value).toLocaleDateString(undefined, options)
// }
</script>

<style scoped>
.q-page-container {
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px - 40px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}
.text-black {
  color: black;
}
.board-page {
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 20px;
  width: 100%;
}

.content-container {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
