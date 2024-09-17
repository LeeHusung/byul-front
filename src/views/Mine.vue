<template>
  <q-page class="q-pa-lg profile-page">
    <div class="content-container">
      <div class="text-h4 q-mb-lg text-center">내 정보</div>

      <div class="profile-info">
        <!-- 프로필 사진 -->
        <div class="profile-picture-container">
          <img :src="profilePictureUrl" alt="프로필 사진" class="profile-picture" />
        </div>

        <div class="user-info">
          <q-item-label class="user-label">이메일: {{ userEmail }}</q-item-label>
          <q-item-label class="user-label">닉네임: {{ nickname }}</q-item-label>
        </div>
      </div>

      <!-- 수정 버튼 -->
      <q-btn label="수정" color="primary" class="q-mt-md full-width-btn" @click="openEditDialog" />

      <!-- 프로필 수정 모달 -->
      <ProfileEditDialog
        ref="editDialog"
        :user-email="userEmail"
        :nickname="nickname"
        :profile-picture-url="profilePictureUrl"
        @profile-updated="handleProfileUpdated"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import ProfileEditDialog from '@/components/ProfileEditDialog.vue';
import useAxios from '@/services/axios.js';
import { useQuasar } from 'quasar';
import '@/assets/mine.css';

const authStore = useAuthStore();
const $q = useQuasar();

const userEmail = ref(authStore.user.memberEmail);
const nickname = ref(authStore.user.memberNickname);
const profilePictureUrl = ref('');
const editDialog = ref(null);

const loadProfile = async () => {
  try {
    const response = await useAxios({
      type: 'get',
      param: `member`
    });

    userEmail.value = response.data.memberEmail;
    nickname.value = response.data.memberNickname;
    profilePictureUrl.value = response.data.memberImageUrl
      ? `http://localhost:8080/api/v1/member/image/${response.data.memberImageUrl}`
      : '/default-profile.png';
  } catch (error) {
    notify('negative', '프로필 정보를 가져오는데 실패했습니다.');
  }
};

const openEditDialog = () => {
  editDialog.value.openDialog();
};

const handleProfileUpdated = async ({
  nickname: newNickname,
  profilePictureUrl: newProfilePictureUrl
}) => {
  nickname.value = newNickname;
  profilePictureUrl.value = newProfilePictureUrl;
  await authStore.fetchUser();
};

const notify = (type, message, position = 'top', icon = null) => {
  $q.notify({
    type: type,
    message: message,
    position: position,
    icon: icon
  });
};

onMounted(() => {
  loadProfile();
});
</script>
