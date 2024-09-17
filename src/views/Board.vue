<template>
  <q-page class="q-pa-lg board-page">
    <div class="content-container">
      <div class="text-h4 q-mb-lg text-center board-title">게시글 목록</div>

      <BoardSearch
        :search-options="searchOptions"
        :initial-search-option="currentSearchOption"
        :initial-search-query="currentSearchQuery"
        @search-results="updatePosts"
      />

      <q-btn label="글 작성" color="primary" class="q-mb-lg post-btn" @click="openDialog" />

      <!-- PostDialog 컴포넌트 -->
      <BoardCreateDialog
        :is-open="isDialogOpen"
        @update:is-open="(val) => (isDialogOpen = val)"
        @post-created="goToDetail"
      />

      <!-- 게시글 목록 -->
      <q-list bordered class="q-mt-lg post-list">
        <q-item
          v-for="board in boards"
          :key="board.id"
          v-ripple
          clickable
          class="post-item"
          @click="goToDetail(board.id)"
        >
          <q-item-section>
            <q-item-label class="post-title">{{ board.title }}</q-item-label>
            <div class="post-info-container">
              <q-item-label class="post-info">
                <div v-if="board.memberImageUrl">
                  <img
                    :src="profileImageUrl(board.memberImageUrl)"
                    alt="프로필 이미지 없음"
                    class="profile-image"
                  />
                </div>
                글쓴이: {{ board.memberNickname }}
              </q-item-label>
              <q-item-label class="post-info">추천: {{ board.boardLikesCount }}</q-item-label>
              <q-item-label class="post-info">댓글: {{ board.commentCount }}</q-item-label>
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- 페이지네이션 -->
      <div class="pagination-container">
        <q-btn flat icon="이전" :disable="currentPageGroup === 1" @click="previousPageGroup" />
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          max-pages="10"
          @update:model-value="pageChanged"
        />
        <q-btn
          flat
          icon="다음"
          :disable="currentPageGroup * 10 >= totalPages"
          @click="nextPageGroup"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import router from '@/router/index.js';
import BoardCreateDialog from '../components/BoardCreateDialog.vue';
import BoardSearch from '../components/BoardSearch.vue';
import '@/assets/board.css';
import useAxios from '@/services/axios.js';
import { useAuthStore } from '@/stores/authStore.js';
const user = useAuthStore();

const $q = useQuasar();
const boards = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 10;
const currentPageGroup = ref(1);

const searchOptions = [
  { label: '전체', value: 'allSearch' },
  { label: '제목', value: 'title' },
  { label: '내용', value: 'content' },
  { label: '작성자', value: 'writer' }
];
const isDialogOpen = ref(false);
const currentSearchOption = ref('allSearch');
const currentSearchQuery = ref('');

const profileImageUrl = (fileName) => {
  return fileName
    ? `http://localhost:8080/api/v1/member/image/${fileName}`
    : '/default-profile.png'; // 기본 이미지
};

const previousPageGroup = () => {
  if (currentPageGroup.value > 1) {
    currentPageGroup.value--;
    currentPage.value = (currentPageGroup.value - 1) * 10 + 1;
    fetchPosts(currentSearchOption.value, currentSearchQuery.value);
  }
};

const nextPageGroup = () => {
  if (currentPageGroup.value * 10 < totalPages.value) {
    currentPageGroup.value++;
    currentPage.value = (currentPageGroup.value - 1) * 10 + 1;
    fetchPosts(currentSearchOption.value, currentSearchQuery.value);
  }
};

const updatePosts = (responseData, searchOption, searchQuery) => {
  boards.value = responseData.boardList;
  totalPages.value = Math.ceil(responseData.totalCount / pageSize);

  currentSearchOption.value = searchOption;
  currentSearchQuery.value = searchQuery;

  sessionStorage.setItem('searchOption', searchOption);
  sessionStorage.setItem('searchQuery', searchQuery);
  sessionStorage.setItem('currentPage', currentPage.value);
};

const loadSearchState = () => {
  const savedSearchOption = sessionStorage.getItem('searchOption') || 'allSearch';
  const savedSearchQuery = sessionStorage.getItem('searchQuery') || '';
  const savedPage = parseInt(sessionStorage.getItem('currentPage')) || 1;

  currentSearchOption.value = savedSearchOption;
  currentSearchQuery.value = savedSearchQuery;
  currentPage.value = savedPage;
};

const fetchPosts = async (searchOption = 'allSearch', searchQuery = '') => {
  try {
    const params = {
      page: currentPage.value - 1,
      size: pageSize
    };

    if (searchOption === 'title') {
      params.title = searchQuery;
    } else if (searchOption === 'content') {
      params.content = searchQuery;
    } else if (searchOption === 'writer') {
      params.memberNickname = searchQuery;
    } else if (searchOption === 'allSearch') {
      params.all = searchQuery;
    }

    const response = await useAxios({
      type: 'get',
      param: `board/search`,
      params: params
    });

    boards.value = response.data.boardList;
    totalPages.value = Math.ceil(response.data.totalCount / pageSize);

    sessionStorage.setItem('currentPage', currentPage.value);
  } catch (error) {
    notify('negative', '게시글을 불러오는데 실패했습니다.');
  }
};

const pageChanged = (newPage) => {
  currentPage.value = newPage;
  fetchPosts(currentSearchOption.value, currentSearchQuery.value);
  sessionStorage.setItem('currentPage', currentPage.value);
};

const goToDetail = (id) => {
  router.push({
    name: 'BoardDetail',
    params: { id }
  });
};

const notify = (type, message, position = 'top', icon = null) => {
  $q.notify({
    type: type,
    message: message,
    position: position,
    icon: icon
  });
};
const openDialog = () => {
  const token = user.token;
  if (!token) {
    notify('negative', '로그인이 필요한 기능입니다.');
    router.push({ name: 'login' });
  } else {
    isDialogOpen.value = true;
  }
};

onMounted(() => {
  loadSearchState();
  fetchPosts(currentSearchOption.value, currentSearchQuery.value);
});
</script>
