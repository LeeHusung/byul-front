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
        <span style="margin-left: 8px">{{ commentLikes }}</span>
      </q-item-label>
      <q-item-label caption>🗓️ 작성: {{ formatDateTime(comment.createdAt) }}</q-item-label>
      <q-item-label caption>⏰ 수정: {{ formatDateTime(comment.lastUpdatedAt) }}</q-item-label>
      <div v-if="comment.memberEmail === user.memberEmail" class="q-mb-lg text-right">
        <q-btn label="수정" color="primary" class="q-mr-sm" @click="openEditCommentDialog" />
        <q-btn label="삭제" color="negative" @click="deleteComment" />
      </div>
    </q-item-section>

    <CommentEditDialog
      v-model="isEditCommentDialogOpen"
      :edited-comment="editedComment"
      @close-dialog="closeDialog"
      @submit="submitEditComment"
    />
  </q-item>
</template>

<script setup>
import { ref } from 'vue';
import useAxios from '@/services/axios.js';
import CommentEditDialog from '@/components/CommentEditDialog.vue';
import { useAuthStore } from '@/stores/authStore.js';
import { notify } from '@/util/notify.js';
import { formatDateTime } from '@/util/timeFormat.js';

const props = defineProps({
  comment: Object,
  commentLikes: Number
});

const emit = defineEmits(['refresh-comments', 'refresh-comment-likes-count']);

const isEditCommentDialogOpen = ref(false);
const editedComment = ref({ ...props.comment });
const commentLikesStatus = ref(false);
const authStore = useAuthStore();
const token = authStore.token;
const user = authStore.user;

const toggleCommentLike = async () => {
  try {
    const likeResponse = await useAxios({
      type: 'get',
      param: `comments/${props.comment.id}/hasLiked`
    });
    if (likeResponse.data === true) {
      await useAxios({
        type: 'delete',
        param: `comments/${props.comment.id}/like`
      });
      commentLikesStatus.value = false;
      emit('refresh-comment-likes-count', props.comment.id, -1);
      notify('positive', '댓글 추천이 취소되었습니다.');
    } else {
      await useAxios({
        type: 'post',
        param: `comments/${props.comment.id}/like`
      });
      commentLikesStatus.value = true;
      emit('refresh-comment-likes-count', props.comment.id, 1);
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
  console.log(props.comment);
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

const closeDialog = async () => {
  isEditCommentDialogOpen.value = false;
  editedComment.value = { ...props.comment };
};
</script>
