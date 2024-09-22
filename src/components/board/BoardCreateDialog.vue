<template>
  <q-dialog v-model="isDialogOpen" persistent>
    <q-card class="new-post-modal">
      <q-card-section>
        <div class="text-h6">새 글 작성</div>
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="submitPost">
          <q-input
            v-model="newPost.title"
            label="제목"
            outlined
            dense
            :rules="titleRules"
            :error="!!titleError"
            :error-message="titleError"
            required
          />
          <q-input
            v-model="newPost.content"
            label="내용"
            type="textarea"
            outlined
            dense
            :rules="contentRules"
            :error="!!contentError"
            :error-message="contentError"
            required
          />
          <input type="file" multiple class="file-input" @change="handleFileChange" />
          <q-btn flat label="취소" color="secondary" @click="closeDialog" />
          <q-btn flat label="작성" type="submit" color="primary" />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue';
import useAxios from '@/services/axios.js';
import { notify, notifyError } from '@/util/notify.js';

const emits = defineEmits(['closeDialog', 'postCreated']);
const isDialogOpen = ref(false);
const newPost = ref({ title: '', content: '' });
const files = ref([]);
const titleError = ref('');
const contentError = ref('');

const titleRules = [
  (val) => !!val || '제목은 필수입니다.',
  (val) => (val?.length >= 8 && val.length <= 20) || '제목은 8자 이상, 20자 이하여야 합니다.'
];

const contentRules = [
  (val) => !!val || '내용은 필수입니다.',
  (val) => val?.length >= 5 || '내용은 최소 5자 이상이어야 합니다.'
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const handleFileChange = (event) => {
  files.value = Array.from(event.target.files).filter((file) => {
    if (file.size > MAX_FILE_SIZE) {
      notify('negative', `파일 크기는 15MB를 넘을 수 없습니다: ${file.name}`);
      return false;
    }
    return true;
  });
  if (files.value.length === 0) event.target.value = '';
};

const submitPost = async () => {
  if (!validateFields()) return;

  const formData = new FormData();
  formData.append(
    'boardCreateRequest',
    new Blob([JSON.stringify(newPost.value)], { type: 'application/json' })
  );
  files.value.forEach((file) => formData.append('images', file));

  try {
    const response = await useAxios({
      type: 'post',
      url: `board`,
      body: formData,
      header: { 'Content-Type': 'multipart/form-data' }
    });
    await closeDialog();
    emits('postCreated', response.data.id);
    notify('positive', '글이 성공적으로 작성되었습니다!');
  } catch (error) {
    console.log(error);
    notifyError(error);
  }
};

const validateFields = () => {
  titleError.value = '';
  contentError.value = '';

  const titleValid = titleRules.every((rule) => rule(newPost.value.title) === true);
  const contentValid = contentRules.every((rule) => rule(newPost.value.content) === true);

  if (!titleValid) {
    titleError.value = '제목은 8자 이상, 20자 이하여야 합니다.';
    return false;
  }

  if (!contentValid) {
    contentError.value = '내용은 5자 이상이어야 합니다.';
    return false;
  }

  return true;
};

const resetForm = () => {
  newPost.value = { title: '', content: '' };
  files.value = [];
  titleError.value = '';
  contentError.value = '';
};

const closeDialog = () => {
  resetForm();
  emits('closeDialog');
};
</script>

<style scoped>
.new-post-modal {
  max-width: 600px;
  border-radius: 12px;
}

.file-input {
  margin-top: 1rem;
}
</style>
