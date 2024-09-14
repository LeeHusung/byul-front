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
            required
            :rules="[titleRules]"
            :error="!!titleError"
            :error-message="titleError"
          />
          <q-input
            v-model="newPost.content"
            label="내용"
            type="textarea"
            outlined
            dense
            :rules="[contentRules]"
            :error="!!contentError"
            :error-message="contentError"
            required
          />
          <input type="file" multiple class="file-input" @change="handleFileChange" />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="취소" color="secondary" @click="closeDialog" />
        <q-btn flat label="작성" color="primary" @click="submitPost" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import useAxios from '@/services/axios.js';

// Props from parent
const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['update:isOpen', 'postCreated']);

const $q = useQuasar();

const isDialogOpen = ref(props.isOpen);
const newPost = ref({ title: '', content: '' });
const files = ref([]);

// Form validation rules
const titleError = ref('');
const contentError = ref('');
const titleRules = [
  (val) => !!val || '제목은 필수입니다.',
  (val) => val.length >= 8 || '제목은 최소 8자 이상이어야 합니다.',
  (val) => val.length <= 20 || '제목은 최대 20자까지 가능합니다.'
];

const contentRules = [
  (val) => !!val || '내용은 필수입니다.',
  (val) => val.length >= 5 || '내용은 최소 5자 이상이어야 합니다.'
];

// File handling
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const handleFileChange = (event) => {
  const selectedFiles = event.target.files;
  const validFiles = [];
  let hasInvalidFile = false;

  for (let i = 0; i < selectedFiles.length; i++) {
    if (selectedFiles[i].size > MAX_FILE_SIZE) {
      hasInvalidFile = true;
      $q.notify({
        type: 'negative',
        message: `파일 크기는 15MB를 넘을 수 없습니다: ${selectedFiles[i].name}`,
        position: 'top',
        icon: null
      });
    } else {
      validFiles.push(selectedFiles[i]);
    }
  }

  if (!hasInvalidFile) {
    files.value = validFiles;
  } else {
    event.target.value = '';
    files.value = [];
  }
};

// Submit post
const submitPost = async () => {
  if (!validateFields()) return;

  const formData = new FormData();
  formData.append(
    'boardCreateRequest',
    new Blob([JSON.stringify({ title: newPost.value.title, content: newPost.value.content })], {
      type: 'application/json'
    })
  );

  for (let i = 0; i < files.value.length; i++) {
    formData.append('images', files.value[i]);
  }

  try {
    // API 호출하여 게시글 생성
    const response = await useAxios({
      type: 'post',
      param: `board`,
      body: formData,
      header: {
        'Content-Type': 'multipart/form-data'
      }
    });
    $q.notify('positive', '글이 성공적으로 작성되었습니다!');
    emit('postCreated'); // 부모 컴포넌트에 게시글 생성 이벤트 알림
    closeDialog();
  } catch (error) {
    console.error(error);
    $q.notify('negative', '글 작성에 실패했습니다.');
  }
};

// Validate form fields
const validateFields = () => {
  titleError.value = '';
  contentError.value = '';

  if (!newPost.value.title || newPost.value.title.length < 8 || newPost.value.title.length > 20) {
    titleError.value = '제목은 8자 이상, 20자 이하여야 합니다.';
    return false;
  }

  if (!newPost.value.content || newPost.value.content.length < 5) {
    contentError.value = '내용은 5자 이상이어야 합니다.';
    return false;
  }

  return true;
};

const closeDialog = () => {
  emit('update:isOpen', false);
};

// Watch for dialog open/close
watch(
  () => props.isOpen,
  (newVal) => {
    isDialogOpen.value = newVal;
  }
);
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
