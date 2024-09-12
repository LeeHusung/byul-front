<template>
  <q-page class="q-pa-lg board-page">
    <div class="content-container">
      <div class="text-h4 q-mb-lg text-center board-title">{{ board.title }}</div>

      <div class="q-mb-lg text-right board-meta">
        <!-- 프로필 이미지 표시 -->
        <!--        <img :src="profileImageUrl" alt="프로필 이미지" class="profile-image" />-->
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

      <q-dialog v-model="isDeleteDialogOpen" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">⚠️ 게시글 삭제</div>
          </q-card-section>

          <q-card-section>정말로 이 게시글을 삭제하시겠습니까?</q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="취소" color="secondary" @click="isDeleteDialogOpen = false" />
            <q-btn flat label="삭제" color="primary" @click="deleteBoard" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- 댓글 목록 -->
      <div class="q-mt-lg">
        <div class="text-h6">💬 댓글: {{ comments.length }}</div>
        <q-list bordered class="q-mt-md">
          <q-item v-for="comment in comments" :key="comment.id">
            <q-item-section>
              <q-item-label>{{ comment.content }}</q-item-label>
              <q-item-label caption>작성자: {{ comment.memberNickname }}</q-item-label>

              <q-item-label
                caption
                class="cursor-pointer"
                style="font-size: 1rem; display: flex; align-items: center"
                @click="toggleCommentLike(comment.id)"
              >
                👍
                <span style="margin-left: 8px">{{ commentLikes[comment.id] || 0 }}</span>
              </q-item-label>

              <q-item-label caption>🗓️ 작성: {{ formatDateTime(comment.createdAt) }} </q-item-label>
              <q-item-label caption
                >⏰ 수정: {{ formatDateTime(comment.lastUpdatedAt) }}</q-item-label
              >
              <div v-if="comment.memberEmail === userEmail" class="q-mb-lg text-right">
                <q-btn
                  label="수정"
                  color="primary"
                  class="q-mr-sm"
                  @click="openEditCommentDialog(comment)"
                />
                <q-btn label="삭제" color="negative" @click="deleteComment(comment.id)" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!--      <CommentForm :submit-comment="submitComment" @submit="submitComment" />-->

      <!-- 댓글 작성 -->
      <q-card bordered class="q-mb-lg">
        <q-card-section>
          <q-form class="comment-form" @submit.prevent="submitComment">
            <q-input
              v-model="newComment.content"
              label="✍️ 댓글 작성"
              outlined
              dense
              class="comment-input"
            />
            <q-btn
              label="작성하기"
              color="primary"
              class="comment-submit-btn q-ml-md"
              type="submit"
            />
          </q-form>
        </q-card-section>
      </q-card>

      <q-btn label="목록으로" color="primary" class="back-btn" icon="list" flat @click="goBack" />

      <EditCommentDialog
        v-model="isEditCommentDialogOpen"
        :edited-comment="editedComment"
        @submit="submitEditComment"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Notify, useQuasar } from 'quasar';
import axios from 'axios';
import EditCommentDialog from '@/components/EditCommentDialog.vue';
import '@/assets/boarddetail.css';
import CommentForm from '@/components/CommentForm.vue';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const board = ref({});
const comments = ref([]);
const newComment = ref({
  content: ''
});
const boardLikes = ref(0);
const commentLikes = ref({});
const commentLikesStatus = ref({});
const boardId = route.params.id;
const hasLikedPost = ref(false);

const token = localStorage.getItem('token');
const userEmail = localStorage.getItem('user');

const isOwnerBoard = computed(() => board.value.memberEmail === userEmail);

const isDeleteDialogOpen = ref(false);

const openEditCommentDialog = (comment) => {
  editedComment.value = { ...comment };
  isEditCommentDialogOpen.value = true;
};

const images = ref([]);
const userImageUrl = computed(() => board.value.memberImageUrl);
const profileImageUrl = computed(() => {
  return userImageUrl.value
    ? `http://localhost:8080/api/v1/member/image/${userImageUrl.value}`
    : '/default-profile.png';
});

const fetchImages = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/v1/board/${boardId}/images`);
    const imageList = response.data.imageList;

    const imagePromises = imageList.map(async (imageData) => {
      const fileName = imageData.url;
      const imageResponse = await axios.get(
        `http://localhost:8080/api/v1/board/image/${fileName}`,
        {
          responseType: 'blob'
        }
      );
      return URL.createObjectURL(imageResponse.data);
    });

    images.value = await Promise.all(imagePromises);
  } catch (error) {
    notify('negative', '이미지를 불러오는데 실패했습니다.');
  }
};

const goBack = () => {
  router.back();
};

const fetchHasLikedPost = async () => {
  if (token != null) {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/board/${boardId}/hasLiked`, {
        headers: { Authorization: `Bearer ${token}` }
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
  isDeleteDialogOpen.value = true;
};

const togglePostLike = async () => {
  try {
    if (hasLikedPost.value) {
      await axios.delete(`http://localhost:8080/api/v1/board/${boardId}/like`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      hasLikedPost.value = false;
      boardLikes.value--;
      await fetchBoardDetail();
      notify('positive', '게시글 추천이 취소되었습니다.');
    } else {
      await axios.post(
        `http://localhost:8080/api/v1/board/${boardId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
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

const toggleCommentLike = async (commentId) => {
  try {
    if (commentLikesStatus.value[commentId]) {
      await axios.delete(`http://localhost:8080/api/v1/comments/${commentId}/like`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      commentLikesStatus.value[commentId] = false;
      commentLikes.value[commentId]--;
      notify('positive', '댓글 추천이 취소되었습니다.');
    } else {
      await axios.post(
        `http://localhost:8080/api/v1/comments/${commentId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      commentLikesStatus.value[commentId] = true;
      commentLikes.value[commentId]++;
      notify('positive', '댓글을 추천하였습니다.');
    }
  } catch (error) {
    if (token == null) {
      notify('negative', '로그인이 필요한 기능입니다.');
    } else {
      notify('negative', error.response?.data?.message || '댓글 추천 처리 중 오류가 발생했습니다.');
    }
  }
};

const fetchBoardDetail = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/v1/board/${boardId}`);
    board.value = response.data;
  } catch (error) {
    notify('negative', '게시글을 불러오는데 실패했습니다.');
  }
};

const deleteBoard = async () => {
  try {
    await axios.delete(`http://localhost:8080/api/v1/board/${boardId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    notify('positive', '글이 성공적으로 삭제되었습니다!');
    isDeleteDialogOpen.value = false;
    await router.push('/board');
  } catch (error) {
    notify('negative', error.response?.data?.message || '처리 중 오류가 발생했습니다.');
  }
};

const fetchComments = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/v1/comments/${boardId}`);
    comments.value = response.data.commentList;

    if (token != null) {
      for (const comment of response.data.commentList) {
        const likeResponsea = await axios.get(
          `http://localhost:8080/api/v1/comments/${comment.id}/hasLiked`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        commentLikesStatus.value[comment.id] = likeResponsea.data;

        const likeResponse = await axios.get(
          `http://localhost:8080/api/v1/comments/${comment.id}/like`
        );
        commentLikes.value[comment.id] = likeResponse.data;
      }
    }
  } catch (error) {
    notify('negative', '댓글을 불러오는데 실패했습니다.');
  }
};

const submitComment = async () => {
  try {
    const payload = {
      content: newComment.value.content,
      boardId: boardId // 필수 데이터 추가
      // userId 또는 다른 필수 데이터가 있을 수 있습니다.
    };
    await axios.post(`http://localhost:8080/api/v1/comments/${boardId}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json' // JSON으로 요청을 보내기 위한 설정
      }
    });
    newComment.value.content = ''; // 댓글 작성 후 초기화
    await fetchComments();
    notify('positive', '댓글이 성공적으로 작성되었습니다!');
  } catch (error) {
    notify(
      'negative',
      error.response?.data?.errors[0]?.reason || '댓글 작성 처리 중 오류가 발생했습니다.'
    );
  }
};

const isEditCommentDialogOpen = ref(false);
const editedComment = ref({ content: '' });

const submitEditComment = async (updatedComment) => {
  try {
    await axios.put(
      `http://localhost:8080/api/v1/comments/${updatedComment.id}`,
      { content: updatedComment.content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    notify('positive', '댓글이 성공적으로 수정되었습니다!');
    isEditCommentDialogOpen.value = false;
    await fetchComments();
  } catch (error) {
    notify('negative', '댓글 수정에 실패했습니다.');
  }
};

const deleteComment = async (commentId) => {
  try {
    await axios.delete(`http://localhost:8080/api/v1/comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    notify('positive', '댓글이 성공적으로 삭제되었습니다!');
    await fetchComments();
  } catch (error) {
    notify('negative', '댓글 삭제에 실패했습니다.');
  }
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
  fetchComments();
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
