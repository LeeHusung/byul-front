<template>
  <q-dialog v-model="isDeleteDialogOpen" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h6">⚠️ 게시글 삭제</div>
      </q-card-section>

      <q-card-section>정말로 이 게시글을 삭제하시겠습니까?</q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="취소" color="secondary" @click="closeDialog" />
        <q-btn flat label="삭제" color="primary" @click="deleteBoard" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue';
import useAxios from '@/services/axios.js';
import router from '@/router/index.js';
import { notify } from '@/util/notify.js';

const props = defineProps({
  boardId: Number
});
const emits = defineEmits(['closeDialog']);

const isDeleteDialogOpen = ref(false);

const deleteBoard = async () => {
  try {
    await useAxios({
      type: 'delete',
      url: `board/${props.boardId}`
    });
    notify('positive', '글이 성공적으로 삭제되었습니다!');
    closeDialog();
    await router.push('/board');
  } catch (error) {
    notify('negative', error.response?.data?.message || '처리 중 오류가 발생했습니다.');
  }
};

const closeDialog = () => {
  emits('closeDialog');
};
</script>
