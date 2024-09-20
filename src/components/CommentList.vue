<template>
  <div>
    <div class="text-h6">💬 댓글: {{ comments.length }}</div>
    <q-list bordered class="q-mt-md">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :comment-likes="commentLikes[comment.id]"
        @refresh-comment-likes-count="updateCommentLikes"
        @refresh-comments="fetchComments"
      />
    </q-list>
    <CommentCreate :board-id="boardId" @comment-submitted="fetchComments" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import useAxios from '@/services/axios.js';
import CommentItem from '@/components/CommentItem.vue';
import CommentCreate from '@/components/CommentCreate.vue';
import { notify } from '@/util/notify.js';

const props = defineProps({
  boardId: Number
});

const comments = ref([]);
const commentLikes = ref({});

const fetchComments = async () => {
  try {
    const response = await useAxios({
      type: 'get',
      param: `comments/${props.boardId}`
    });
    comments.value = response.data.commentList;

    response.data.commentList.forEach((comment) => {
      commentLikes.value[comment.id] = comment.commentsLikesCount;
    });
  } catch (error) {
    notify('negative', '댓글을 불러오는데 실패했습니다.');
  }
};

const updateCommentLikes = (commentId, change) => {
  commentLikes.value[commentId] = (commentLikes.value[commentId] || 0) + change;
};

onMounted(() => {
  fetchComments();
});
</script>
