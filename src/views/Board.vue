<template>
  <q-page class="q-pa-lg board-page">
    <div class="content-container">
      <div class="text-h4 q-mb-lg text-center board-title">게시판</div>

      <BoardSearch
        :search-options="searchOptions"
        :initial-search-option="currentSearchOption"
        :initial-search-query="currentSearchQuery"
        @search-results="updateBoards"
      />

      <BoardCreateDialog
        v-model="isDialogOpen"
        @close-dialog="closeDialog"
        @post-created="goToDetail"
      />

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
                <div>
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

      <div class="button-container" style="text-align: right">
        <q-btn label="글 작성" color="primary" class="q-mb-lg post-btn" @click="openDialog" />
      </div>

      <div class="pagination-container">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          max-pages="10"
          @update:model-value="pageChanged"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import router from '@/router/index.js';
import BoardCreateDialog from '../components/board/BoardCreateDialog.vue';
import BoardSearch from '../components/board/BoardSearch.vue';
import '@/assets/css/board.css';
import useAxios from '@/services/axios.js';
import { useAuthStore } from '@/stores/authStore.js';
import { onBeforeRouteLeave } from 'vue-router';
import { notify, notifyError } from '@/util/notify.js';

const user = useAuthStore();
const boards = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 10;

const searchOptions = [
  { label: '전체', value: 'allSearch' },
  { label: '제목', value: 'title' },
  { label: '내용', value: 'content' },
  { label: '작성자', value: 'writer' }
];
const isDialogOpen = ref(false);
const currentSearchOption = ref('allSearch');
const currentSearchQuery = ref('');

const profileImageUrl = (imageUrl) => {
  if (imageUrl == null) {
    return new URL('@/assets/images/baseImage.jpg', import.meta.url).href;
  } else {
    return `http://localhost:8080/api/v1/member/image/${imageUrl}`;
  }
};

const updateBoards = (searchOption, searchQuery, page = 1) => {
  currentSearchOption.value = searchOption;
  currentSearchQuery.value = searchQuery;
  currentPage.value = page;
  fetchBoards(searchOption, searchQuery);
};

const loadSearchState = () => {
  const savedSearchOption = sessionStorage.getItem('searchOption') || 'allSearch';
  const savedSearchQuery = sessionStorage.getItem('searchQuery') || '';
  const savedPage = parseInt(sessionStorage.getItem('currentPage')) || 1;

  currentSearchOption.value = savedSearchOption;
  currentSearchQuery.value = savedSearchQuery;
  currentPage.value = savedPage;
};

const fetchBoards = async (searchOption = 'allSearch', searchQuery = '') => {
  try {
    const params = {
      page: currentPage.value - 1
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
      url: `board/search`,
      params: params
    });
    console.log(response);
    boards.value = response.data.boardList;
    totalPages.value = Math.ceil(response.data.totalCount / pageSize);

    sessionStorage.setItem('currentPage', currentPage.value);
  } catch (error) {
    notifyError(error);
  }
};

const pageChanged = (newPage) => {
  currentPage.value = newPage;
  fetchBoards(currentSearchOption.value, currentSearchQuery.value);
  sessionStorage.setItem('currentPage', currentPage.value);
};

const goToDetail = (id) => {
  console.log(id);
  router.push({
    name: 'BoardDetail',
    params: { id }
  });
};

const openDialog = () => {
  if (!user) {
    notify('negative', '로그인이 필요한 기능입니다.');
    router.push({ name: 'login' });
  } else {
    isDialogOpen.value = true;
  }
};
const closeDialog = () => {
  isDialogOpen.value = false;
};

onBeforeRouteLeave((to, from, next) => {
  if (to.name !== 'BoardDetail') {
    sessionStorage.removeItem('searchOption');
    sessionStorage.removeItem('searchQuery');
    sessionStorage.removeItem('currentPage');
  }
  next();
});

onMounted(() => {
  loadSearchState();
  fetchBoards(currentSearchOption.value, currentSearchQuery.value);
});
</script>
