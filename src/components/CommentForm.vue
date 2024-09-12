<template>
  <q-card bordered class="q-mb-lg">
    <q-card-section>
      <q-form class="comment-form" @submit.prevent="act">
        <q-input
          v-model="newComment.content"
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

const props = defineProps({
  submitComment: Function
});
const act = ref(props.submitComment);

const newComment = ref({
  content: ''
});
</script>
