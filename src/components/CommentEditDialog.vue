<template>
  <q-dialog persistent>
    <q-card>
      <q-card-section>
        <div class="text-h6">📝 댓글 수정</div>
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="submitEditComment">
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
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="취소" color="secondary" @click="closeDialog" />
        <q-btn flat label="수정" color="primary" @click="submitEditComment" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue';

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

const submitEditComment = () => {
  if (!validateField()) return;
  emits('submit', localEditedComment.value);
  closeDialog();
};
</script>
