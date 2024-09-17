<template>
  <q-page class="q-pa-lg board-page">
    <div class="content-container">
      <div class="text-h4 q-mb-lg text-center board-title">{{ board.title }}</div>

      <div class="q-mb-lg text-right board-meta">
        <q-item-label>
          <img :src="profileImageUrl" alt="프로필 이미지 없음" class="profile-image" />
          작성자: {{ board.memberNickname }}
        </q-item-label>
        <q-item-label>
          <span
            :style="{ color: hasLikedPost ? 'red' : 'grey' }"
            class="heart-icon"
            @click="togglePostLike"
          >
            ❤️
          </span>
          좋아요: {{ board.boardLikesCount }}
        </q-item-label>

        <q-btn
          color="red"
          flat
          :label="hasLikedPost ? '추천완료' : '게시글 추천하기'"
          @click="togglePostLike"
        ></q-btn>
        <q-item-label>🗓️ 생성: {{ formatDateTime(board.createdAt) }}</q-item-label>
        <q-item-label>⏰ 수정: {{ formatDateTime(board.lastUpdatedAt) }}</q-item-label>
      </div>

      <div v-if="isOwnerBoard" class="q-mb-lg text-right board-actions">
        <q-btn label="수정" color="primary" @click="navigateToUpdateBoard" />
        <q-btn label="삭제" color="negative" @click="openDeleteDialog" />
      </div>

      <q-card bordered class="q-mb-lg board-content">
        <q-card-section>
          <q-item-label class="text-black">{{ board.content }}</q-item-label>
        </q-card-section>
      </q-card>

      <div v-if="images.length" class="image-gallery q-mb-lg">
        <q-item-label class="text-h6">🖼️ 이미지</q-item-label>
        <div class="image-grid">
          <div v-for="image in images" :key="image" class="image-container">
            <img :src="image" alt="게시글 이미지" class="board-image" />
          </div>
        </div>
      </div>

      <BoardDeleteDialog
        ref="deleteBoardDialog"
        :board-id="boardId"
        :on-delete-success="handleDeleteSuccess"
      />

      <CommentList
        :board-id="boardId"
        :user-email="user.memberEmail"
        :format-date-time="formatDateTime"
      />

      <q-btn label="목록으로" color="primary" class="back-btn" icon="list" flat @click="goBack" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import '@/assets/boarddetail.css';
import useAxios from '@/services/axios.js';
import { useAuthStore } from '@/stores/authStore.js';
import CommentList from '@/components/CommentList.vue';
import BoardDeleteDialog from '@/components/BoardDeleteDialog.vue';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const deleteBoardDialog = ref(null);
const board = ref({});

const boardLikes = ref(0);
const boardId = Number(route.params.id);
const hasLikedPost = ref(false);

const authStore = useAuthStore();
const token = localStorage.getItem('token');
const user = authStore.user;
//TODO
const isOwnerBoard = computed(() => board.value.memberEmail === user.memberEmail);

const isDeleteDialogOpen = ref(false);

const images = ref([]);
const userImageUrl = computed(() => board.value.memberImageUrl);
const profileImageUrl = computed(() => {
  //TODO
  // 여긴 왜 이렇게?
  return userImageUrl.value
    ? `http://localhost:8080/api/v1/member/image/${userImageUrl.value}`
    : '/default-profile.png';
});

const fetchImages = async () => {
  try {
    const response = await useAxios({
      type: 'get',
      param: `board/${boardId}/images`
    });
    const imageList = response.data.imageList;

    const imagePromises = imageList.map(async (imageData) => {
      const fileName = imageData.url;
      const imageResponse = await useAxios({
        type: 'get',
        param: `board/image/${fileName}`,
        options: { responseType: 'blob' }
      });
      return URL.createObjectURL(imageResponse.data);
    });

    images.value = await Promise.all(imagePromises);
  } catch (error) {
    notify('negative', '이미지를 불러오는데 실패했습니다.');
  }
};

const goBack = () => {
  const page = route.query.page || 1; // 이전 페이지 정보를 가져옴
  const searchOption = route.query.searchOption || 'allSearch'; // 검색 옵션
  const query = route.query.query || ''; // 검색어

  // 목록 페이지로 이동 시 검색 옵션과 검색어도 함께 전달
  router.push({
    name: 'Board',
    query: {
      page: page,
      searchOption: searchOption,
      query: query
    }
  });
};

const fetchHasLikedPost = async () => {
  if (token != null) {
    try {
      const response = await useAxios({
        type: 'get',
        param: `board/${boardId}/hasLiked`
      });
      hasLikedPost.value = response.data;
    } catch (error) {
      notify('negative', '좋아요 상태를 확인하는데 실패했습니다.');
    }
  }
};

const navigateToUpdateBoard = () => {
  router.push(`/board/${boardId}/edit`);
};

const openDeleteDialog = () => {
  deleteBoardDialog.value.openDialog();
};

const togglePostLike = async () => {
  try {
    if (hasLikedPost.value) {
      await useAxios({
        type: 'delete',
        param: `board/${boardId}/like`
      });
      hasLikedPost.value = false;
      boardLikes.value--;
      await fetchBoardDetail();
      notify('positive', '게시글 추천이 취소되었습니다.');
    } else {
      await useAxios({
        type: 'post',
        param: `board/${boardId}/like`
      });
      hasLikedPost.value = true;
      boardLikes.value++;
      await fetchBoardDetail();
      notify('positive', '게시글 추천이 성공했습니다!');
    }
  } catch (error) {
    if (token == null) {
      notify('negative', '로그인이 필요한 기능입니다.');
    } else {
      notify(
        'negative',
        error.response?.data?.message || '게시글 추천 처리 중 오류가 발생했습니다.'
      );
    }
  }
};

const fetchBoardDetail = async () => {
  try {
    const response = await useAxios({
      type: 'get',
      param: `board/${boardId}`
    });
    board.value = response.data;
  } catch (error) {
    notify('negative', '게시글을 불러오는데 실패했습니다.');
  }
};

const handleDeleteSuccess = () => {
  router.push('/board'); // 게시글 삭제 후 목록으로 이동
};

const notify = (type, message, position = 'top', icon = null) => {
  $q.notify({
    type: type,
    message: message,
    position: position,
    icon: icon
  });
};

onMounted(() => {
  fetchBoardDetail();
  fetchHasLikedPost();
  fetchImages();
});

const formatDateTime = (datetime) => {
  const date = new Date(datetime);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};
</script>
