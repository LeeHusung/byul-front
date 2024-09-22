<template>
  <q-page class="q-pa-lg profile-page">
    <div class="content-container">
      <div class="text-h4 q-mb-lg text-center">마이페이지</div>

      <div class="profile-info">
        <div class="profile-picture-container">
          <img :src="profilePictureUrl" alt="프로필 사진" class="profile-picture" />
        </div>

        <div class="user-info">
          <q-item-label class="user-label">이메일: {{ userEmail }}</q-item-label>
          <q-item-label class="user-label">닉네임: {{ nickname }}</q-item-label>
        </div>
      </div>

      <q-btn label="수정" color="primary" class="q-mt-md full-width-btn" @click="openEditDialog" />

      <ProfileEditDialog
        v-model="isEditProfileDialogOpen"
        :nickname="nickname"
        :profile-picture-url="profilePictureUrl"
        @profile-updated="handleProfileUpdated"
        @close-dialog="closeDialog"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import ProfileEditDialog from '@/components/ProfileEditDialog.vue';
import useAxios from '@/services/axios.js';
import '@/assets/css/mine.css';
import { notify, notifyError } from '@/util/notify.js';

const authStore = useAuthStore();

const userEmail = ref(authStore.user.memberEmail);
const nickname = ref(authStore.user.memberNickname);
const profilePictureUrl = ref('');
const isEditProfileDialogOpen = ref(false);

const loadProfile = async () => {
  try {
    const response = await useAxios({
      type: 'get',
      url: `member`
    });
    nickname.value = authStore.user.memberNickname;

    profilePictureUrl.value = response.data.memberImageUrl
      ? `http://localhost:8080/api/v1/member/image/${response.data.memberImageUrl}`
      : new URL('@/assets/images/baseImage.jpg', import.meta.url).href;
  } catch (error) {
    notifyError(error);

    notify('negative', '프로필 정보를 가져오는데 실패했습니다.');
  }
};

const openEditDialog = () => {
  isEditProfileDialogOpen.value = true;
};

const closeDialog = async () => {
  isEditProfileDialogOpen.value = false;
};

const handleProfileUpdated = async ({
  nickname: newNickname,
  profilePictureUrl: newProfilePictureUrl
}) => {
  nickname.value = newNickname;
  profilePictureUrl.value = newProfilePictureUrl;
  authStore.user.memberNickname = newNickname;
};

onMounted(() => {
  loadProfile();
});
</script>
