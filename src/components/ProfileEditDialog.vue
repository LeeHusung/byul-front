<template>
  <q-dialog v-model="isEditDialogOpen" v-bind="$attrs" persistent>
    <q-card class="edit-modal">
      <q-card-section>
        <div class="text-h6">내 정보 수정</div>
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md" @submit="saveProfile">
          <q-input
            v-model="editNickname"
            label="닉네임"
            outlined
            dense
            class="profile-input"
            :rules="[nicknameRules]"
            :error="!!nicknameError"
            :error-message="nicknameError"
            @blur="checkNickname"
          />
          <q-item-label v-if="nicknameMessage" class="text-positive">{{
            nicknameMessage
          }}</q-item-label>

          <q-item-label class="q-mt-md">프로필 사진</q-item-label>
          <div class="profile-picture-container">
            <img
              :src="profilePictureUrl"
              alt="프로필 사진을 추가해주세요"
              class="profile-picture"
            />
          </div>
          <input type="file" class="q-mt-md profile-input" @change="onProfilePictureChange" />
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="action-buttons">
        <q-btn flat label="취소" color="secondary" @click="closeEditDialog" />
        <q-btn flat label="저장" color="primary" @click="saveProfile" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue';
import useAxios from '@/services/axios.js';
import { notify } from '@/util/notify.js';

const props = defineProps({
  nickname: String,
  profilePictureUrl: String
});

const emits = defineEmits(['profile-updated', 'closeDialog']);

const isEditDialogOpen = ref(false);
const editNickname = ref(props.nickname);
const nicknameError = ref('');
const nicknameMessage = ref('');
const profilePictureUrl = ref(props.profilePictureUrl);
const files = ref([]);

const closeEditDialog = () => {
  emits('closeDialog');
};

const checkNickname = async () => {
  try {
    const response = await useAxios({
      type: 'get',
      url: `member/check-nickname?nickname=${editNickname.value}`
    });
    if (response.data === true) {
      nicknameError.value = '이미 사용 중인 닉네임입니다.';
      nicknameMessage.value = '';
    } else {
      nicknameError.value = '';
      nicknameMessage.value = '사용 가능한 닉네임입니다.';
    }
  } catch (error) {
    nicknameError.value = '닉네임 중복 검사 중 오류가 발생했습니다.';
    nicknameMessage.value = '';
  }
};

const nicknameRules = [
  (val) => !!val || '닉네임을 입력하세요',
  () => !nicknameError.value || nicknameError.value
];

const onProfilePictureChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  profilePictureUrl.value = URL.createObjectURL(file);
  files.value = [file];
};

const saveProfile = async () => {
  if (nicknameError.value) {
    notify('negative', nicknameError.value);
    return;
  }

  const formData = new FormData();
  formData.append('nickname', editNickname.value);

  if (files.value && files.value.length > 0) {
    formData.append('image', files.value[0]);
  }

  try {
    const response = await useAxios({
      type: 'put',
      url: `member/profile`,
      body: formData,
      header: {
        'Content-Type': 'multipart/form-data'
      }
    });

    emits('profile-updated', {
      nickname: editNickname.value,
      profilePictureUrl: `http://localhost:8080/api/v1/member/image/${response.data.memberImageUrl}`
    });

    closeEditDialog();
    notify('positive', '프로필 정보가 성공적으로 저장되었습니다!');
  } catch (error) {
    notify('negative', '프로필 저장 중 오류가 발생했습니다.');
  }
};
</script>
