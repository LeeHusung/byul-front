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
        :is-open="isDialogOpen"
        @update:is-open="(val) => (isDialogOpen = val)"
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

      <div class="button-container" style="text-align: right">
        <q-btn label="글 작성" color="primary" class="q-mb-lg post-btn" @click="openDialog" />
      </div>

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
import router from '@/router/index.js';
import BoardCreateDialog from '../components/board/BoardCreateDialog.vue';
import BoardSearch from '../components/board/BoardSearch.vue';
import '@/assets/css/board.css';
import useAxios from '@/services/axios.js';
import { useAuthStore } from '@/stores/authStore.js';
import { onBeforeRouteLeave } from 'vue-router';
import { notify } from '@/util/notify.js';

const user = useAuthStore();
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
/**
 * TODO
 * URL SRC로 바로 호출하면 백엔드 서버에 2번 호출.
 * axios로 호출하면 10번 호출. 이미지도 안나옴. 이유는?
 */
const profileImageUrl = (fileName) => {
  console.log(fileName);
  return fileName
    ? `http://localhost:8080/api/v1/member/image/${fileName}`
    : '/default-profile.png';
};
// const profileImageUrl = async (fileName) => {
//   return await useAxios({
//     type: 'get',
//     param: `member/image/${fileName}`
//   });
// };
const previousPageGroup = () => {
  if (currentPageGroup.value > 1) {
    currentPageGroup.value--;
    currentPage.value = (currentPageGroup.value - 1) * 10 + 1;
    fetchBoards(currentSearchOption.value, currentSearchQuery.value);
  }
};

const nextPageGroup = () => {
  if (currentPageGroup.value * 10 < totalPages.value) {
    currentPageGroup.value++;
    currentPage.value = (currentPageGroup.value - 1) * 10 + 1;
    fetchBoards(currentSearchOption.value, currentSearchQuery.value);
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
    console.log(response);
    boards.value = response.data.boardList;
    totalPages.value = Math.ceil(response.data.totalCount / pageSize);

    sessionStorage.setItem('currentPage', currentPage.value);
  } catch (error) {
    notify('negative', '게시글을 불러오는데 실패했습니다.');
  }
};

const pageChanged = (newPage) => {
  currentPage.value = newPage;
  fetchBoards(currentSearchOption.value, currentSearchQuery.value);
  sessionStorage.setItem('currentPage', currentPage.value);
};

const goToDetail = (id) => {
  router.push({
    name: 'BoardDetail',
    params: { id }
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
