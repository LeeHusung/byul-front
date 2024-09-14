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
import { useQuasar } from 'quasar'; // Quasar의 notify 기능을 사용해 사용자에게 알림을 표시합니다.

// 부모 컴포넌트에서 전달받을 props를 정의합니다.
const props = defineProps({
  boardId: {
    type: Number,
    required: true,
  },
  onCommentSubmitted: Function, // 부모 컴포넌트에서 호출할 콜백 함수
});

const $q = useQuasar(); // Quasar의 notify 기능을 사용하기 위해 초기화합니다.
const commentContent = ref(''); // 사용자 입력을 저장할 변수

// 댓글 제출 함수
const submitComment = async () => {
  // 댓글 내용이 비어 있는지 확인
  if (commentContent.value.trim() === '') {
    notify('negative', '댓글 내용을 입력해주세요.');

    return; // 빈 댓글이면 함수를 종료합니다.
  }

  try {
    // 서버에 전송할 데이터 준비
    const payload = {
      content: commentContent.value,
    };

    // 서버에 댓글을 제출하는 요청을 보냅니다.
    await useAxios({
      type: 'post',
      param: `comments/${props.boardId}`,
      body: payload,
    });

    // 댓글 작성 후 입력란을 비웁니다.
    commentContent.value = '';

    // 성공 알림을 표시하고, 부모 컴포넌트에 알립니다.
    notify('positive', '댓글이 성공적으로 작성되었습니다!');
    if (props.onCommentSubmitted) {
      props.onCommentSubmitted(); // 부모 컴포넌트의 콜백 함수 호출
    }
  } catch (error) {
    console.log(error);
    // 에러가 발생하면 사용자에게 알림을 표시합니다.
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
