<template>
  <q-page class="q-pa-lg board-page">
    <div class="content-container">
      <div class="text-h4 q-mb-lg text-center board-title">게시글 목록</div>

      <!-- 글 작성 버튼 (모달 트리거) -->
      <q-btn label="글 작성" color="primary" class="q-mb-lg post-btn" @click="openDialog" />

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
            <div class="post-info-container">
              <!-- 프로필 이미지 표시 -->
              <q-item-label class="post-info">
                <div v-if="post.memberImageUrl">
                  <img
                    :src="profileImageUrl(post.memberImageUrl)"
                    alt="프로필 이미지 없음"
                    class="profile-image"
                  />
                </div>
                글쓴이: {{ post.memberNickname }}
              </q-item-label>
              <q-item-label class="post-info">추천: {{ post.boardLikesCount }}</q-item-label>
              <q-item-label class="post-info">댓글: {{ post.commentCount }}</q-item-label>
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- 페이지네이션 -->
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

      <!-- PostDialog 컴포넌트 -->
      <PostDialog
        :is-open="isDialogOpen"
        @update:is-open="(val) => (isDialogOpen = val)"
        @submit-post="submitPost"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';
import router from '@/router/index.js';
import PostDialog from '../components/PostCreateDialog.vue';
import '@/assets/board.css';

const $q = useQuasar();
const posts = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 10;
const currentPageGroup = ref(1);

const isDialogOpen = ref(false);

const profileImageUrl = (fileName) => {
  return fileName
    ? `http://localhost:8080/api/v1/member/image/${fileName}`
    : '/default-profile.png'; // 기본 이미지
};

const previousPageGroup = () => {
  if (currentPageGroup.value > 1) {
    currentPageGroup.value--;
    currentPage.value = (currentPageGroup.value - 1) * 10 + 1;
  }
};

const nextPageGroup = () => {
  if (currentPageGroup.value * 10 < totalPages.value) {
    currentPageGroup.value++;
    currentPage.value = (currentPageGroup.value - 1) * 10 + 1;
  }
};

const fetchPosts = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/v1/board`, {
      params: { page: currentPage.value - 1, size: pageSize }
    });
    posts.value = response.data.boardList;
    totalPages.value = Math.ceil(response.data.totalCount / pageSize);
  } catch (error) {
    notify('negative', '게시글을 불러오는데 실패했습니다.');
  }
};

const goToDetail = (id) => {
  router.push(`/board/${id}`);
};

const notify = (type, message, position = 'top', icon = null) => {
  $q.notify({
    type: type,
    message: message,
    position: position,
    icon: icon
  });
};

const submitPost = async (formData) => {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.post(`http://localhost:8080/api/v1/board`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    notify('positive', '글이 성공적으로 작성되었습니다!');
    await router.push(`/board/${response.data.id}`);
    isDialogOpen.value = false;
  } catch (error) {
    console.log(error);
    notify('negative', error.response.data.message);
  }
};

const openDialog = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    notify('negative', '로그인이 필요한 기능입니다.');
    router.push({ name: 'login' });
  } else {
    isDialogOpen.value = true;
  }
};

onMounted(fetchPosts);
</script>
