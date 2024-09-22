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
          :error="!!commentError"
          :error-message="commentError"
        />
        <q-btn label="작성하기" color="primary" class="comment-submit-btn q-ml-md" type="submit" />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue';
import useAxios from '@/services/axios.js';
import { notify, notifyError } from '@/util/notify.js';

const props = defineProps({
  boardId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['commentSubmitted']);
const commentContent = ref('');
const commentError = ref('');
const commentRules = [
  (val) => !!val || '내용은 필수입니다.',
  (val) => val?.length >= 5 || '내용은 최소 5자 이상이어야 합니다.'
];

const validateField = () => {
  commentError.value = '';

  for (let rule of commentRules) {
    const result = rule(commentContent.value);
    if (result !== true) {
      commentError.value = result;
      return false;
    }
  }

  return true;
};

const submitComment = async () => {
  if (!validateField()) return;

  try {
    const payload = {
      content: commentContent.value
    };

    await useAxios({
      type: 'post',
      url: `comments/${props.boardId}`,
      body: payload
    });

    commentContent.value = '';

    notify('positive', '댓글이 성공적으로 작성되었습니다!');
    emit('commentSubmitted');
  } catch (error) {
    notifyError(error);
  }
};
</script>
