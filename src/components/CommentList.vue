<template>
  <div>
    <div class="text-h6">💬 댓글: {{ comments.length }}</div>
    <q-list bordered class="q-mt-md">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :commentLikes="commentLikes"
        :userEmail="userEmail"
        :formatDateTime="formatDateTime"
        @refresh-comments="fetchComments"
      />
    </q-list>
    <!-- 댓글 작성 -->
    <CommentCreate :boardId="boardId" :onCommentSubmitted="fetchComments" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import useAxios from '@/services/axios.js';
import { useQuasar } from 'quasar';
import CommentItem from '@/components/CommentItem.vue';
import CommentCreate from '@/components/CommentCreate.vue';

const $q = useQuasar();
const props = defineProps({
  boardId: Number,
  userEmail: String,
  formatDateTime: Function
});

const comments = ref([]);
const commentLikes = ref({});
const token = localStorage.getItem('token');

const fetchComments = async () => {
  try {
    const response = await useAxios({
      type: 'get',
      param: `comments/${props.boardId}`
    });
    comments.value = response.data.commentList;

    if (token != null) {
      for (const comment of response.data.commentList) {
        const likeResponse = await useAxios({
          type: 'get',
          param: `comments/${comment.id}/like`
        });
        commentLikes.value[comment.id] = likeResponse.data;
      }
    }
  } catch (error) {
    notify('negative', '댓글을 불러오는데 실패했습니다.');
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
  fetchComments();
});
</script>
