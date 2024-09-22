<template>
  <div class="comments-container">
    <div class="text-h6">💬 댓글: {{ totalComments }}</div>
    <q-list bordered class="q-mt-md comments-list">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :comment-likes="commentLikes[comment.id]"
        @refresh-comment-likes-count="updateCommentLikes"
        @refresh-comments="fetchComments"
      />
    </q-list>

    <q-pagination
      v-model="currentPage"
      :max="totalPages"
      max-pages="10"
      class="q-mt-md pagination-fixed"
      @update:model-value="fetchComments"
    />

    <CommentCreate :board-id="boardId" @comment-submitted="handleCommentSubmitted" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import useAxios from '@/services/axios.js';
import CommentItem from '@/components/comment/CommentItem.vue';
import CommentCreate from '@/components/comment/CommentCreate.vue';
import { notify, notifyError } from '@/util/notify.js';

const props = defineProps({
  boardId: Number
});

const comments = ref([]);
const commentLikes = ref({});
const totalComments = ref(0);
const totalPages = ref(0);
const currentPage = ref(1);
const pageSize = 5;

const fetchComments = async () => {
  try {
    const response = await useAxios({
      type: 'get',
      url: `comments/${props.boardId}`,
      params: {
        page: currentPage.value - 1,
        size: pageSize
      }
    });
    console.log(response);
    comments.value = response.data.commentList;
    totalComments.value = response.data.totalCount;
    totalPages.value = response.data.totalPages;

    response.data.commentList.forEach((comment) => {
      commentLikes.value[comment.id] = comment.commentsLikesCount;
    });
  } catch (error) {
    notifyError(error);
  }
};

const handleCommentSubmitted = () => {
  totalComments.value += 1;
  currentPage.value = totalPages.value = Math.ceil(totalComments.value / pageSize); // 마지막 페이지로 이동
  fetchComments();
};

onMounted(() => {
  fetchComments();
});

const updateCommentLikes = (commentId, change) => {
  commentLikes.value[commentId] = (commentLikes.value[commentId] || 0) + change;
};
</script>

<style scoped>
.comments-container {
  position: relative;
  min-height: 400px; /* 최소 높이를 지정하여 페이지네이션이 항상 하단에 있게 함 */
  padding-bottom: 80px; /* 페이지네이션 고정 위치를 위한 공간 확보 */
}

.comments-list {
  padding-bottom: 60px; /* 페이지네이션과 댓글 간의 공간을 확보 */
}

.pagination-fixed {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center; /* 페이지네이션을 가운데 정렬 */
}
</style>
