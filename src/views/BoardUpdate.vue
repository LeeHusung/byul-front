<template>
  <q-page class="q-pa-lg update-board-page">
    <div class="content-container">
      <div class="text-h4 q-mb-lg text-center">게시글 수정</div>

      <q-form @submit.prevent="submitUpdateBoard">
        <q-input
          v-model="board.title"
          label="제목"
          outlined
          dense
          required
          :rules="titleRules"
          :error="!!titleError"
          :error-message="titleError"
        />
        <q-input
          v-model="board.content"
          label="내용"
          type="textarea"
          outlined
          dense
          required
          :rules="contentRules"
          :error="!!contentError"
          :error-message="contentError"
        />

        <div class="q-mt-lg">
          <div class="text-h6 q-mb-md">이미지 수정</div>

          <q-list bordered class="q-mt-md">
            <q-item v-for="(image, index) in images" :key="index">
              <q-item-section>
                <img :src="image" alt="게시글 이미지" class="board-image" />
              </q-item-section>
              <q-item-section side>
                <!-- 삭제 버튼 클릭 시 삭제할 이미지 목록에 추가 -->
                <q-btn label="삭제" color="negative" @click="markImageForDeletion(index)" />
              </q-item-section>
            </q-item>
          </q-list>

          <q-uploader label="새로운 이미지 추가" accept="image/*" multiple @added="onImageAdded" />
        </div>

        <q-btn label="수정 완료" type="submit" color="primary" class="q-mt-lg" />
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import axios from 'axios';
import useAxios from '@/services/axios.js';
import { notify } from '@/util/notify.js';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const boardId = route.params.id;
const board = ref({ title: '', content: '' });
const images = ref([]);
const originalImages = ref([]); // 서버에서 받아온 원본 이미지 URL을 저장하는 배열
const imagesToDelete = ref([]); // 삭제할 이미지 URL을 저장하는 배열
const newImages = ref([]); // 새로 추가한 이미지를 저장하는 배열

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

// 기존 게시글 및 이미지 정보 가져오기
const fetchBoardDetail = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/v1/board/${boardId}`);
    board.value = response.data;

    const imageResponse = await axios.get(`http://localhost:8080/api/v1/board/${boardId}/images`);
    const imageList = imageResponse.data.imageList;

    originalImages.value = imageList.map((imageData) => imageData.url);

    const imagePromises = imageList.map(async (imageData) => {
      const imageResponse = await useAxios({
        type: 'get',
        url: `board/image/${imageData.url}`,
        options: { responseType: 'blob' }
      });
      return URL.createObjectURL(imageResponse.data); // blob URL 생성
    });

    images.value = await Promise.all(imagePromises);
  } catch (error) {
    notify('negative', '게시글 정보를 불러오는데 실패했습니다.');
  }
};

// 새로 추가한 이미지를 관리하는 함수
const onImageAdded = (addedFiles) => {
  newImages.value.push(...addedFiles);
};

// 삭제할 이미지를 목록에 추가
const markImageForDeletion = (index) => {
  const deletedImage = originalImages.value[index];
  imagesToDelete.value.push(deletedImage); // 삭제할 이미지를 추적
  images.value.splice(index, 1); // UI에서 즉시 이미지 삭제
  originalImages.value.splice(index, 1); // 원본 이미지 배열에서도 삭제
};

// 삭제할 이미지 처리 함수
const deleteImages = async () => {
  try {
    if (imagesToDelete.value.length > 0) {
      // 각 이미지를 개별적으로 처리 (순차적으로 요청)
      for (const imageUrl of imagesToDelete.value) {
        await useAxios({
          type: 'delete',
          url: `board/${boardId}/image`,
          params: { imageUrl }
        });
      }
    }
  } catch (error) {
    notify('negative', '이미지 삭제 중 오류가 발생했습니다.');
    throw error;
  }
};

const uploadNewImages = async () => {
  if (newImages.value.length > 0) {
    const formData = new FormData();

    newImages.value.forEach((file) => {
      formData.append('images', file);
    });

    try {
      await useAxios({
        type: 'post',
        url: `board/${boardId}/image`,
        body: formData,
        header: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      notify('negative', '이미지 업로드 중 오류가 발생했습니다.');
      throw error;
    }
  }
};

const validateFields = () => {
  titleError.value = '';
  contentError.value = '';

  const titleValid = titleRules.every((rule) => rule(board.value.title) === true);
  const contentValid = contentRules.every((rule) => rule(board.value.content) === true);

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

const submitUpdateBoard = async () => {
  if (!validateFields()) return;

  try {
    await deleteImages();

    await uploadNewImages();

    const boardUpdateRequest = {
      title: board.value.title,
      content: board.value.content
    };

    await useAxios({
      type: 'put',
      url: `board/${boardId}`,
      body: boardUpdateRequest
    });
    notify('positive', '게시글이 성공적으로 수정되었습니다!');
    await router.push(`/board/${boardId}`);
  } catch (error) {
    if (error.response) {
      notify('negative', `${error.response.data.message || error.response.data.errors[0]}`);
    } else {
      notify('negative', '게시글 수정 중 오류가 발생했습니다.');
    }
  }
};

onMounted(() => {
  fetchBoardDetail();
});
</script>

<style scoped>
.update-board-page {
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 20px;
  width: 100%;
}

.content-container {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.board-image {
  max-width: 100px;
  max-height: 100px;
  object-fit: cover;
  margin-right: 10px;
}
</style>
