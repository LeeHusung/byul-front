<template>
  <q-dialog persistent>
    <q-card>
      <q-card-section>
        <div class="text-h6">📝 댓글 수정</div>
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="submitEditComment(localEditedComment)">
          <q-input
            v-model="localEditedComment.content"
            label="댓글 내용"
            type="textarea"
            outlined
            dense
            required
            :error="!!commentError"
            :error-message="commentError"
          />
          <q-btn flat label="취소" color="secondary" @click="closeDialog" />
          <q-btn flat label="수정" type="submit" color="primary" />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue';
import useAxios from '@/services/axios.js';
import { notify, notifyError } from '@/util/notify.js';

const props = defineProps({
  editedComment: Object
});

const emits = defineEmits(['closeDialog', 'submit']);
const localEditedComment = ref({ ...props.editedComment });

const commentError = ref('');
const commentRules = [
  (val) => !!val || '내용은 필수입니다.',
  (val) => val?.length >= 5 || '내용은 최소 5자 이상이어야 합니다.'
];

const validateField = () => {
  commentError.value = '';

  for (let rule of commentRules) {
    const result = rule(localEditedComment.value.content);
    if (result !== true) {
      commentError.value = result;
      return false;
    }
  }

  return true;
};

const closeDialog = () => {
  emits('closeDialog');
};

const submitEditComment = async (updatedComment) => {
  if (!validateField()) return;

  try {
    await useAxios({
      type: 'put',
      url: `comments/${updatedComment.id}`,
      body: { content: updatedComment.content }
    });
    notify('positive', '댓글이 성공적으로 수정되었습니다!');
    await emits('submit');

    closeDialog();
  } catch (error) {
    notifyError(error);
  }
};
</script>
