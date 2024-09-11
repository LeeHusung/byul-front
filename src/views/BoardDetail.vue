<template>
  <q-page class="q-pa-lg board-page">
    <div class="content-container">
      <div class="text-h4 q-mb-lg text-center board-title">{{ board.title }}</div>

      <div class="q-mb-lg text-right board-meta">
        <q-item-label>❤️ 게시글 좋아요 수: {{ board.boardLikesCount }} </q-item-label>
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
                v-if="comment.memberEmail !== userEmail"
                caption
                class="cursor-pointer"
                style="font-size: 1.5rem; display: flex; align-items: center"
                @click="toggleCommentLike(comment.id)"
              >
                댓글 추천하기: 👍
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

      <!-- 댓글 작성 -->
      <q-card bordered class="q-mb-lg">
        <q-card-section>
          <q-form @submit.prevent="submitComment">
            <q-input v-model="newComment.content" label="✍️ 댓글 작성" outlined dense />
            <q-btn label="작성하기" color="primary" class="q-mt-md" type="submit" />
          </q-form>
        </q-card-section>
      </q-card>

      <!-- 글 수정 모달 -->
      <q-dialog v-model="isEditDialogOpen" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">📝 글 수정</div>
          </q-card-section>

          <q-card-section>
            <q-form class="q-gutter-md" @submit.prevent="submitEdit">
              <q-input
                v-model="editedBoard.title"
                label="제목"
                outlined
                dense
                required
                :error="!!validationErrors.title"
                :error-message="validationErrors.title"
              />
              <q-input
                v-model="editedBoard.content"
                label="내용"
                type="textarea"
                outlined
                dense
                required
                :error="!!validationErrors.content"
                :error-message="validationErrors.content"
              />
            </q-form>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="취소" color="secondary" @click="closeEditDialog" />
            <q-btn flat label="수정" color="primary" @click="submitEdit" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- 댓글 수정 모달 -->
      <q-dialog v-model="isEditCommentDialogOpen" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">📝 댓글 수정</div>
          </q-card-section>

          <q-card-section>
            <q-form class="q-gutter-md" @submit.prevent="submitEditComment">
              <q-input
                v-model="editedComment.content"
                label="댓글 내용"
                type="textarea"
                outlined
                dense
                required
              />
            </q-form>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="취소" color="secondary" @click="closeEditCommentDialog" />
            <q-btn flat label="수정" color="primary" @click="submitEditComment" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Notify, useQuasar } from 'quasar';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore.js';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

// 게시글 상세 정보 및 수정 모달 상태 변수
const board = ref({});
const isEditDialogOpen = ref(false);
const editedBoard = ref({
  title: '',
  content: ''
});
const comments = ref([]);
const newComment = ref({
  content: ''
});
const boardLikes = ref(0); // 게시글 좋아요 수
const commentLikes = ref({}); // 댓글별 좋아요 수 저장 객체
const commentLikesStatus = ref({}); // 댓글 좋아요 여부 저장 객체
// 게시글 ID 추출 (라우트에서 가져옴)
const boardId = route.params.id;
const hasLikedPost = ref(false);
// authStore에서 현재 로그인된 사용자 정보 가져오기
const authStore = useAuthStore();

const token = localStorage.getItem('token');
const userEmail = localStorage.getItem('user');

// 게시글 작성자와 현재 로그인된 사용자의 이메일 비교
const isOwnerBoard = computed(() => board.value.memberEmail === userEmail);

const isDeleteDialogOpen = ref(false);

const validationErrors = ref({}); // 유효성 검사 에러를 저장할 객체

const images = ref([]);

const fetchImages = async () => {
  try {
    // 이미지 리스트 가져오기
    const response = await axios.get(`http://localhost:8080/api/v1/board/${boardId}/images`);
    const imageList = response.data.imageList;

    // 이미지 URL을 사용해 각 이미지를 다시 요청
    const imagePromises = imageList.map(async (imageData) => {
      const fileName = imageData.url;
      const imageResponse = await axios.get(
        `http://localhost:8080/api/v1/board/image/${fileName}`,
        {
          responseType: 'blob'
        }
      );
      return URL.createObjectURL(imageResponse.data); // 브라우저에서 사용할 수 있는 객체 URL 생성
    });

    // 모든 이미지 데이터를 images 배열에 저장
    images.value = await Promise.all(imagePromises);
  } catch (error) {
    $q.notify({ type: 'negative', message: '이미지를 불러오는데 실패했습니다.' });
  }
};

// 게시글 좋아요 여부 확인
const fetchHasLikedPost = async () => {
  if (token != null) {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/board/${boardId}/hasLiked`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      hasLikedPost.value = response.data;
    } catch (error) {
      $q.notify({ type: 'negative', message: '좋아요 상태를 확인하는데 실패했습니다.' });
    }
  }
};

const navigateToUpdateBoard = () => {
  router.push(`/board/${boardId}/edit`);
};

const openDeleteDialog = () => {
  isDeleteDialogOpen.value = true;
};
// 게시글 좋아요/취소
const togglePostLike = async () => {
  try {
    if (hasLikedPost.value) {
      await axios.delete(`http://localhost:8080/api/v1/board/${boardId}/like`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      hasLikedPost.value = false;
      boardLikes.value--;
      await fetchBoardDetail();
      $q.notify({ type: 'positive', message: '게시글 추천이 취소되었습니다.' });
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
      $q.notify({ type: 'positive', message: '게시글 추천이 성공했습니다!' });
    }
  } catch (error) {
    if (token == null) {
      $q.notify({ type: 'negative', message: '로그인이 필요한 기능입니다.' });
    } else {
      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = error.response.data.message;
        console.log(error);
        $q.notify({ type: 'negative', message: errorMessage });
      } else {
        $q.notify({ type: 'negative', message: '게시글 추천 처리 중 오류가 발생했습니다.' });
      }
    }
  }
};

// 댓글 좋아요/취소
const toggleCommentLike = async (commentId) => {
  try {
    if (commentLikesStatus.value[commentId]) {
      console.log(commentLikesStatus);
      await axios.delete(`http://localhost:8080/api/v1/comments/${commentId}/like`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      commentLikesStatus.value[commentId] = false;
      commentLikes.value[commentId]--;
      $q.notify({ type: 'positive', message: '댓글 추천이 취소되었습니다.' });
    } else {
      console.log(commentLikesStatus.value[commentId]);
      await axios.post(
        `http://localhost:8080/api/v1/comments/${commentId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('추천성공');
      commentLikesStatus.value[commentId] = true;
      commentLikes.value[commentId]++;
      // $q.notify({ type: 'positive', message: '댓글 추천이 성공했습니다!' })
      Notify.create('댓글 추천이 성공!!!');
    }
  } catch (error) {
    if (token == null) {
      $q.notify({ type: 'negative', message: '로그인이 필요한 기능입니다.' });
    } else {
      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = error.response.data.message;
        $q.notify({ type: 'negative', message: errorMessage });
      } else {
        $q.notify({ type: 'negative', message: '댓글 추천 처리 중 오류가 발생했습니다.' });
      }
    }
  }
};

// 게시글 상세 정보 불러오기
const fetchBoardDetail = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/v1/board/${boardId}`);
    board.value = response.data;
  } catch (error) {
    $q.notify({ type: 'negative', message: '게시글을 불러오는데 실패했습니다.' });
  }
};

// 게시글 수정 제출
const submitEdit = async () => {
  try {
    console.log(editedBoard.value);
    await axios.put(
      `http://localhost:8080/api/v1/board/${boardId}`,
      {
        title: editedBoard.value.title,
        content: editedBoard.value.content
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    $q.notify({ type: 'positive', message: '글이 성공적으로 수정되었습니다!' });
    isEditDialogOpen.value = false;
    validationErrors.value = {}; // 성공 시 에러 초기화
    fetchBoardDetail(); // 수정 후 다시 게시글 상세 정보를 불러옴
  } catch (error) {
    if (error.response && error.response.status === 400) {
      validationErrors.value = error.response.data.errors.reduce((acc, curr) => {
        acc[curr.field] = curr.reason;
        return acc;
      }, {});
    } else if (error.response && error.response.data && error.response.data.message) {
      const errorMessage = error.response.data.message;
      console.log(errorMessage);
      $q.notify({ type: 'negative', message: errorMessage });
    } else {
      $q.notify({ type: 'negative', message: '처리 중 오류가 발생했습니다.' });
    }
  }
};

// 게시글 삭제
const deleteBoard = async () => {
  //TODO PROMISE 참고 적용
  try {
    await axios.delete(`http://localhost:8080/api/v1/board/${boardId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    $q.notify({ type: 'positive', message: '글이 성공적으로 삭제되었습니다!' });
    isDeleteDialogOpen.value = false;
    router.push('/board');
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      const errorMessage = error.response.data.message;
      $q.notify({ type: 'negative', message: errorMessage });
    } else {
      $q.notify({ type: 'negative', message: '처리 중 오류가 발생했습니다.' });
    }
  }
};

// 댓글 목록 불러오기
const fetchComments = async () => {
  try {
    if (token != null) {
      const response = await axios.get(`http://localhost:8080/api/v1/comments/${boardId}`);
      comments.value = response.data.commentList;
      console.log(comments.value);
      for (const comment of response.data.commentList) {
        const likeResponsea = await axios.get(
          `http://localhost:8080/api/v1/comments/${comment.id}/hasLiked`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        // 댓글의 추천 여부를 commentLikesStatus에 저장
        commentLikesStatus.value[comment.id] = likeResponsea.data;
        const likeResponse = await axios.get(
          `http://localhost:8080/api/v1/comments/${comment.id}/like`
        );
        commentLikes.value[comment.id] = likeResponse.data;
      }
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: '댓글을 불러오는데 실패했습니다.' });
  }
};

// 댓글 작성하기
const submitComment = async () => {
  try {
    await axios.post(`http://localhost:8080/api/v1/comments/${boardId}`, newComment.value, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    newComment.value.content = ''; // 댓글 작성 후 초기화
    fetchComments(); // 댓글 목록 새로고침
    $q.notify({ type: 'positive', message: '댓글이 성공적으로 작성되었습니다!', position: 'top' });
  } catch (error) {
    if (token == null) {
      $q.notify({ type: 'negative', message: '로그인이 필요한 기능입니다.' });
    } else {
      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = error.response.data.errors[0].reason;
        $q.notify({ type: 'negative', message: errorMessage });
      } else {
        $q.notify({ type: 'negative', message: '댓글 작성 처리 중 오류가 발생했습니다.' });
      }
    }
  }
};
const editedComment = ref({ content: '' });
const isEditCommentDialogOpen = ref(false); // 댓글 수정 모달 상태

const openEditCommentDialog = (comment) => {
  editedComment.value = { ...comment };
  isEditCommentDialogOpen.value = true;
};
// 댓글 수정 관련 상태 변수

// 댓글 수정 제출
const submitEditComment = async () => {
  try {
    await axios.put(
      `http://localhost:8080/api/v1/comments/${editedComment.value.id}`,
      { content: editedComment.value.content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    $q.notify({ type: 'positive', message: '댓글이 성공적으로 수정되었습니다!' });
    isEditCommentDialogOpen.value = false;
    fetchComments(); // 수정 후 댓글 목록 갱신
  } catch (error) {
    $q.notify({ type: 'negative', message: '댓글 수정에 실패했습니다.' });
  }
};
// 댓글 수정 모달 닫기
const closeEditCommentDialog = () => {
  isEditCommentDialogOpen.value = false;
};

// 댓글 삭제
const deleteComment = async (commentId) => {
  try {
    await axios.delete(`http://localhost:8080/api/v1/comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    $q.notify({ type: 'positive', message: '댓글이 성공적으로 삭제되었습니다!' });
    fetchComments(); // 삭제 후 댓글 목록 갱신
  } catch (error) {
    $q.notify({ type: 'negative', message: '댓글 삭제에 실패했습니다.' });
  }
};
// 수정 모달 닫기
const closeEditDialog = () => {
  isEditDialogOpen.value = false;
};

onMounted(() => {
  fetchBoardDetail(); // 게시글 정보 불러오기
  fetchHasLikedPost();
  fetchComments(); // 댓글 정보 불러오기
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

<style scoped>
/* Board Page General Styling */
.text-black {
  color: #333;
}

.board-page {
  background-color: #fafafa;
  min-height: calc(100vh - 60px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 40px;
  padding-bottom: 40px;
  width: 100%;
}

.content-container {
  background-color: #fff;
  padding: 2rem;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.text-h4.board-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.q-mb-lg.text-right.board-meta .q-item-label {
  color: #7f8c8d;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
}

.q-btn {
  font-weight: 500;
}

/* Image Gallery Styling */
.image-gallery {
  margin-top: 20px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.image-container {
  position: relative;
  padding-top: 100%; /* Aspect ratio 1:1 */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.board-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.board-image:hover {
  transform: scale(1.05);
}

.image-gallery .text-h6 {
  margin-bottom: 10px;
}

/* Comments Section */
.q-list {
  margin-top: 1rem;
  border-radius: 8px;
  background-color: #f9f9f9;
  padding: 0.5rem;
}

.q-item {
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 0;
}

.q-item-label {
  font-size: 1rem;
  color: #34495e;
}

.q-item-label[caption] {
  font-size: 0.85rem;
  color: #95a5a6;
}

.q-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.q-dialog .q-card {
  max-width: 500px;
  width: 100%;
}

.q-btn {
  border-radius: 8px;
}

.q-input input {
  font-size: 1rem;
  padding: 0.75rem;
}

.q-input {
  margin-bottom: 1rem;
}

.q-card-actions {
  padding: 1rem 1.5rem;
}

.board-content {
  white-space: pre-wrap;
}
</style>
