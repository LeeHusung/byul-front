<template>
  <q-page class="q-pa-lg board-page">
    <div class="content-container">
      <div class="text-h4 q-mb-lg text-center board-title" style="color: rebeccapurple">목록</div>

      <!-- 글 작성 버튼 (모달 트리거) -->
      <q-btn label="글 작성" color="primary" class="q-mb-lg" @click="openDialog" />

      <!-- 게시글 목록 -->
      <q-list bordered class="q-mt-lg post-list">
        <q-item
          v-for="post in posts"
          :key="post.id"
          v-ripple
          clickable
          class="post-item"
          @click="goToDetail(post.id)"
        >
          <q-item-section>
            <q-item-label class="post-title">{{ post.title }}</q-item-label>
            <!--            <q-item-label class="post-content">{{ post.content }}</q-item-label>-->
            <div class="post-info-container">
              <q-item-label class="post-info"
                ><q-icon /> 글쓴이: {{ post.memberNickname }}</q-item-label
              >
              <q-item-label class="post-info"
                ><q-icon /> 추천: {{ post.boardLikesCount }}
              </q-item-label>
              <q-item-label class="post-info"
                ><q-icon /> 댓글: {{ post.commentCount }}</q-item-label
              >
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <div class="pagination-container">
        <q-btn flat icon="이전" :disable="currentPageGroup === 1" @click="previousPageGroup" />
        <q-pagination
          v-model="currentPage"
          :max="Math.min(currentPageGroup * 10, totalPages)"
          :min="(currentPageGroup - 1) * 10 + 1"
          max-pages="10"
          @update:model-value="fetchPosts"
        />
        <q-btn
          flat
          icon="다음"
          :disable="currentPageGroup * 10 >= totalPages"
          @click="nextPageGroup"
        />
      </div>

      <!-- 글 작성 모달 -->
      <q-dialog v-model="isDialogOpen" persistent>
        <q-card class="new-post-modal">
          <q-card-section>
            <div class="text-h6">새 글 작성</div>
          </q-card-section>

          <q-card-section>
            <q-form class="q-gutter-md" @submit.prevent="submitPost">
              <q-input
                v-model="newPost.title"
                label="제목"
                outlined
                dense
                required
                :rules="[titleRules]"
                :error="!!titleError"
                :error-message="titleError"
              />
              <q-input
                v-model="newPost.content"
                label="내용"
                type="textarea"
                outlined
                dense
                :rules="[contentRules]"
                :error="!!contentError"
                :error-message="contentError"
                required
              />
              <input type="file" multiple class="file-input" @change="handleFileChange" />
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
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';
import router from '@/router/index.js';

const $q = useQuasar();
const posts = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 10;
// 현재 페이지 그룹 (1~10, 11~20 등)
const currentPageGroup = ref(1);

const isDialogOpen = ref(false);
const newPost = ref({ title: '', content: '' });
const files = ref([]);
const token = localStorage.getItem('token');

const titleError = ref('');
const contentError = ref('');
// 제목 검증 규칙
const titleRules = [
  (val) => !!val || '제목은 필수입니다.',
  (val) => val.length >= 8 || '제목은 최소 8자 이상이어야 합니다.',
  (val) => val.length <= 20 || '제목은 최대 20자까지 가능합니다.'
];

// 내용 검증 규칙
const contentRules = [
  (val) => !!val || '내용은 필수입니다.',
  (val) => val.length >= 5 || '내용은 최소 5자 이상이어야 합니다.'
];
// 입력값 검증 함수
const validateFields = () => {
  titleError.value = '';
  contentError.value = '';

  if (!newPost.value.title || newPost.value.title.length < 8 || newPost.value.title.length > 20) {
    titleError.value = '제목은 8자 이상, 20자 이하여야 합니다.';
    return false;
  }

  if (!newPost.value.content || newPost.value.content.length < 5) {
    contentError.value = '내용은 5자 이상이어야 합니다.';
    return false;
  }

  return true;
};

// 이전 페이지 그룹으로 이동
const previousPageGroup = () => {
  if (currentPageGroup.value > 1) {
    currentPageGroup.value--;
    currentPage.value = (currentPageGroup.value - 1) * 10 + 1; // 해당 그룹의 첫 페이지로 이동
  }
};

// 다음 페이지 그룹으로 이동
const nextPageGroup = () => {
  if (currentPageGroup.value * 10 < totalPages.value) {
    currentPageGroup.value++;
    currentPage.value = (currentPageGroup.value - 1) * 10 + 1; // 해당 그룹의 첫 페이지로 이동
  }
};
const fetchPosts = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/v1/board`, {
      params: { page: currentPage.value - 1, size: pageSize }
    });
    posts.value = response.data.boardList;
    console.log(posts);
    totalPages.value = Math.ceil(response.data.totalCount / pageSize);
  } catch (error) {
    $q.notify({ type: 'negative', message: '게시글을 불러오는데 실패했습니다.' });
  }
};

const goToDetail = (id) => {
  router.push(`/board/${id}`);
};

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const handleFileChange = (event) => {
  const selectedFiles = event.target.files;
  const validFiles = [];
  let hasInvalidFile = false;

  for (let i = 0; i < selectedFiles.length; i++) {
    if (selectedFiles[i].size > MAX_FILE_SIZE) {
      hasInvalidFile = true;
      $q.notify({
        type: 'negative',
        message: `파일 크기는 15MB를 넘을 수 없습니다: ${selectedFiles[i].name}`
      });
    } else {
      validFiles.push(selectedFiles[i]);
    }
  }

  if (!hasInvalidFile) {
    files.value = validFiles;
  } else {
    event.target.value = '';
    files.value = [];
  }
};

const submitPost = async () => {
  if (!validateFields()) return;
  const formData = new FormData();
  formData.append(
    'boardCreateRequest',
    new Blob([JSON.stringify({ title: newPost.value.title, content: newPost.value.content })], {
      type: 'application/json'
    })
  );
  for (let i = 0; i < files.value.length; i++) {
    formData.append('images', files.value[i]);
  }

  try {
    const response = await axios.post(`http://localhost:8080/api/v1/board`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    console.log(response);
    $q.notify({ type: 'positive', message: '글이 성공적으로 작성되었습니다!' });
    router.push(`/board/${response.data.id}`);
    resetForm();
  } catch (error) {
    if (error.response.status === 413) {
      $q.notify({
        type: 'negative',
        message: '파일 하나의 최대크기는 10MB, 한 번에 최대 업로드 가능 용량은 30MB 입니다'
      });
    } else if (error.response.status === 400) {
      $q.notify({ type: 'negative', message: '잘못된 요청입니다. 다시 시도해 주세요.' });
    } else {
      $q.notify({ type: 'negative', message: '글 작성 중 오류가 발생했습니다.' });
    }
    resetForm();
  }
};

const resetForm = () => {
  newPost.value = { title: '', content: '' };
  files.value = [];
  isDialogOpen.value = false;
};
const openDialog = () => {
  if (!token) {
    $q.notify({ type: 'negative', message: '로그인이 필요한 기능입니다.' });
    router.push({ name: 'login', query: { redirect: '/board/create' } });
  } else {
    isDialogOpen.value = true;
  }
};

const closeDialog = () => {
  isDialogOpen.value = false;
};

onMounted(fetchPosts);
</script>

<style scoped>
/* Board Page */
.board-page {
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  padding-top: 20px;
  width: 100%;
}

.content-container {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 1200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.board-title {
  color: #333;
  font-weight: bold;
}

.post-list {
  margin-bottom: 2rem;
}

.post-item {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.post-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.post-title,
.post-content {
  color: #333;
}

.post-info-container {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  color: #666;
}

.post-info {
  font-size: 0.875rem;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.paging {
  background-color: transparent;
}

/* Modal Styling */
.new-post-modal {
  max-width: 500px;
}

.file-input {
  margin-top: 1rem;
}

.q-btn {
  margin-top: 1rem;
}
</style>
