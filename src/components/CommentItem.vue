<template>
  <q-item>
    <q-item-section>
      <q-item-label>{{ comment.content }}</q-item-label>
      <q-item-label caption>작성자: {{ comment.memberNickname }}</q-item-label>
      <q-item-label
        caption
        class="cursor-pointer"
        style="font-size: 1rem; display: flex; align-items: center"
        @click="toggleCommentLike"
      >
        👍
        <span style="margin-left: 8px">{{ commentLikes[comment.id] || 0 }}</span>
      </q-item-label>
      <q-item-label caption>🗓️ 작성: {{ formatDateTime(comment.createdAt) }}</q-item-label>
      <q-item-label caption>⏰ 수정: {{ formatDateTime(comment.lastUpdatedAt) }}</q-item-label>
      <div v-if="comment.memberEmail === userEmail" class="q-mb-lg text-right">
        <q-btn
          label="수정"
          color="primary"
          class="q-mr-sm"
          @click="openEditCommentDialog"
        />
        <q-btn label="삭제" color="negative" @click="deleteComment" />
      </div>
    </q-item-section>

    <!-- 댓글 수정 다이얼로그 -->
    <CommentEditDialog
      v-model="isEditCommentDialogOpen"
      :edited-comment="editedComment"
      @submit="submitEditComment"
    />
  </q-item>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import useAxios from '@/services/axios.js';
import CommentEditDialog from '@/components/CommentEditDialog.vue';

const $q = useQuasar();
const props = defineProps({
  comment: Object,
  commentLikes: Object,
  userEmail: String,
  formatDateTime: Function,
});

const emit = defineEmits(['refresh-comments']);

const isEditCommentDialogOpen = ref(false);
const editedComment = ref({ ...props.comment });
const commentLikesStatus = ref(false);
const token = localStorage.getItem('token');

const fetchCommentLikesStatus = async () => {
  try {
    const likeResponse = await useAxios({
      type: 'get',
      param: `comments/${props.comment.id}/hasLiked`
    });
    commentLikesStatus.value = likeResponse.data;
  } catch (error) {
    console.error('Failed to fetch comment like status:', error);
  }
};

const toggleCommentLike = async () => {
  try {
    if (commentLikesStatus.value) {
      await useAxios({
        type: 'delete',
        param: `comments/${props.comment.id}/like`
      });
      commentLikesStatus.value = false;
      props.commentLikes[props.comment.id]--;
      notify('positive', '댓글 추천이 취소되었습니다.');
    } else {
      await useAxios({
        type: 'post',
        param: `comments/${props.comment.id}/like`
      });
      commentLikesStatus.value = true;
      props.commentLikes[props.comment.id]++;
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

const openEditCommentDialog = () => {
  editedComment.value = { ...props.comment };
  isEditCommentDialogOpen.value = true;
};

const submitEditComment = async (updatedComment) => {
  try {
    await useAxios({
      type: 'put',
      param: `comments/${updatedComment.id}`,
      body: { content: updatedComment.content }
    });
    notify('positive', '댓글이 성공적으로 수정되었습니다!');
    isEditCommentDialogOpen.value = false;
    emit('refresh-comments');
  } catch (error) {
    notify('negative', '댓글 수정에 실패했습니다.');
  }
};

const deleteComment = async () => {
  try {
    await useAxios({
      type: 'delete',
      param: `comments/${props.comment.id}`
    });
    notify('positive', '댓글이 성공적으로 삭제되었습니다!');
    emit('refresh-comments');
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

// Fetch the initial like status for the comment
fetchCommentLikesStatus();
</script>
