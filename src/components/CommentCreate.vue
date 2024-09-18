<!-- components/CommentCreate.vue -->
<template>
  <q-card bordered class="q-mb-lg">
    <q-card-section>
      <q-form class="comment-form" @submit.prevent="submitComment">
        <q-input
          v-model="commentContent"
          label="✍️ 댓글 작성"
          outlined
          dense
          class="comment-input"
        />
        <q-btn label="작성하기" color="primary" class="comment-submit-btn q-ml-md" type="submit" />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue';
import useAxios from '@/services/axios.js';
import { useQuasar } from 'quasar';

const props = defineProps({
  boardId: {
    type: Number,
    required: true
  },
  onCommentSubmitted: Function
});

const $q = useQuasar();
const commentContent = ref('');

const submitComment = async () => {
  if (commentContent.value.trim() === '') {
    notify('negative', '댓글 내용을 입력해주세요.');

    return;
  }

  try {
    const payload = {
      content: commentContent.value
    };

    await useAxios({
      type: 'post',
      param: `comments/${props.boardId}`,
      body: payload
    });

    commentContent.value = '';

    notify('positive', '댓글이 성공적으로 작성되었습니다!');
    if (props.onCommentSubmitted) {
      props.onCommentSubmitted();
    }
  } catch (error) {
    console.log(error);
    notify('negative', error.response?.data?.message);
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
</script>
