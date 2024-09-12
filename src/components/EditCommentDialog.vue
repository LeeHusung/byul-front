<template>
  <q-dialog v-model="internalModelValue" persistent>
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
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  editedComment: Object
});

const emits = defineEmits(['update:modelValue', 'submit']);

const internalModelValue = computed({
  get: () => props.modelValue,
  set: (value) => emits('update:modelValue', value)
});

// 로컬 복사본 생성하여 `v-model`로 사용
const localEditedComment = ref({ ...props.editedComment });

watch(
  () => props.editedComment,
  (newValue) => {
    localEditedComment.value = { ...newValue }; // prop이 업데이트될 때 로컬 복사본 업데이트
  }
);

const closeDialog = () => {
  internalModelValue.value = false;
};

const submitEditComment = () => {
  emits('submit', localEditedComment.value); // 수정된 댓글 데이터를 부모로 전달
  closeDialog();
};
</script>
