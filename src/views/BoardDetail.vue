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
            ❤
          </span>
          좋아요: {{ board.boardLikesCount }}
        </q-item-label>
        <q-item-label>🗓️ 생성: {{ formatDateTime(board.createdAt) }}</q-item-label>
        <q-item-label v-if="board.createdAt !== board.lastUpdatedAt"
          >⏰ 수정: {{ formatDateTime(board.lastUpdatedAt) }}</q-item-label
        >
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
        v-model="isDeleteDialogOpen"
        :board-id="boardId"
        @close-dialog="closeDialog"
      />

      <CommentList :board-id="boardId" />

      <q-btn label="목록으로" color="primary" class="back-btn" flat @click="goBack" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import '@/assets/css/boarddetail.css';
import useAxios from '@/services/axios.js';
import { useAuthStore } from '@/stores/authStore.js';
import CommentList from '@/components/comment/CommentList.vue';
import BoardDeleteDialog from '@/components/board/BoardDeleteDialog.vue';
import { notify, notifyError } from '@/util/notify.js';
import { formatDateTime } from '@/util/timeFormat.js';

const router = useRouter();
const route = useRoute();
const board = ref({});

const boardId = Number(route.params.id);
const hasLikedPost = ref(false);

const authStore = useAuthStore();
const token = authStore.token;
const user = authStore.user;

const isOwnerBoard = computed(() => {
  if (user == null) {
    return false;
  }
  return board.value.memberEmail === user.memberEmail;
});

const images = ref([]);
const userImageUrl = computed(() => board.value.memberImageUrl);
const profileImageUrl = computed(() => {
  return userImageUrl.value
    ? `http://localhost:8080/api/v1/member/image/${userImageUrl.value}`
    : new URL('@/assets/images/baseImage.jpg', import.meta.url).href;
});

const fetchImages = async () => {
  try {
    const response = await useAxios({
      type: 'get',
      url: `board/${boardId}/images`
    });
    const imageList = response.data.imageList;

    images.value = imageList.map(
      (imageData) => `http://localhost:8080/api/v1/board/image/${imageData.url}`
    );
  } catch (error) {
    notifyError(error);
  }
};

const goBack = () => {
  router.push({
    name: 'Board'
  });
};

const fetchHasLikedPost = async () => {
  if (user != null) {
    try {
      const response = await useAxios({
        type: 'get',
        url: `board/${boardId}/hasLiked`
      });
      hasLikedPost.value = response.data;
    } catch (error) {
      notifyError(error);
    }
  }
};

const navigateToUpdateBoard = () => {
  router.push(`/board/${boardId}/edit`);
};

const isDeleteDialogOpen = ref(false);

const openDeleteDialog = () => {
  isDeleteDialogOpen.value = true;
};

const closeDialog = () => {
  isDeleteDialogOpen.value = false;
};

const togglePostLike = async () => {
  try {
    if (hasLikedPost.value) {
      await useAxios({
        type: 'delete',
        url: `board/${boardId}/like`
      });
      hasLikedPost.value = false;
      //TODO fetch가 필요할까?
      await fetchBoardDetail();
      notify('positive', '게시글 추천이 취소되었습니다.');
    } else {
      await useAxios({
        type: 'post',
        url: `board/${boardId}/like`
      });
      hasLikedPost.value = true;
      await fetchBoardDetail();
      notify('positive', '게시글 추천이 성공했습니다!');
    }
  } catch (error) {
    if (token == null) {
      notify('negative', '로그인이 필요한 기능입니다.');
    } else {
      notifyError(error);
    }
  }
};

const fetchBoardDetail = async () => {
  try {
    const response = await useAxios({
      type: 'get',
      url: `board/${boardId}`
    });
    console.log(response);
    board.value = response.data;
  } catch (error) {
    notifyError(error);
  }
};

onMounted(() => {
  fetchBoardDetail();
  fetchHasLikedPost();
  fetchImages();
});
</script>
