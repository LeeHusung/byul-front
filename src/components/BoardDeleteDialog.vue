<!-- DeleteBoardDialog.vue -->
<template>
  <q-dialog v-model="isDialogOpen" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h6">⚠️ 게시글 삭제</div>
      </q-card-section>

      <q-card-section>정말로 이 게시글을 삭제하시겠습니까?</q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="취소" color="secondary" @click="isDialogOpen = false" />
        <q-btn flat label="삭제" color="primary" @click="deleteBoard" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import useAxios from '@/services/axios.js';
import router from '@/router/index.js';

const props = defineProps({
  boardId: Number
});

const $q = useQuasar();
const isDialogOpen = ref(false);

const deleteBoard = async () => {
  try {
    await useAxios({
      type: 'delete',
      param: `board/${props.boardId}`
    });
    $q.notify('positive', '글이 성공적으로 삭제되었습니다!');
    isDialogOpen.value = false;
    await router.push('/board');
  } catch (error) {
    $q.notify('negative', error.response?.data?.message || '처리 중 오류가 발생했습니다.');
  }
};

const openDialog = () => {
  isDialogOpen.value = true;
};

defineExpose({
  openDialog
});
</script>
