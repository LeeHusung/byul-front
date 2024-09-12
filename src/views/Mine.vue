<template>
  <q-page class="q-pa-lg profile-page">
    <div class="content-container">
      <div class="text-h4 q-mb-lg text-center">내 정보</div>

      <!-- 프로필 사진 및 정보 -->
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
    </div>

    <!-- 수정 모달 -->
    <q-dialog v-model="isEditDialogOpen" persistent>
      <q-card class="edit-modal">
        <q-card-section>
          <div class="text-h6">내 정보 수정</div>
        </q-card-section>

        <q-card-section>
          <q-form class="q-gutter-md" @submit.prevent="saveProfile">
            <!-- 닉네임 수정 -->
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

            <!-- 프로필 사진 수정 -->
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
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useQuasar } from 'quasar';
import axios from 'axios';
import '@/assets/mine.css';

const authStore = useAuthStore();
const $q = useQuasar();

// 사용자 정보
const userEmail = ref('');
const nickname = ref('');
const profilePictureUrl = ref('');
const isEditDialogOpen = ref(false);
const editNickname = ref('');
const nicknameError = ref('');
const nicknameMessage = ref('');
const files = ref([]); // 프로필 사진 파일을 관리하는 변수

// 프로필 정보 로드
const loadProfile = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/v1/member', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });

    userEmail.value = response.data.memberEmail;
    nickname.value = response.data.memberNickname;

    // 받아온 이미지 파일명을 서버 이미지 API와 연결하여 URL 생성
    profilePictureUrl.value = response.data.memberImageUrl
      ? `http://localhost:8080/api/v1/member/image/${response.data.memberImageUrl}`
      : '/default-profile.png'; // 프로필 사진이 없을 경우 기본 사진 사용

    editNickname.value = nickname.value; // 수정용 닉네임 초기화
  } catch (error) {
    $q.notify({ type: 'negative', message: '프로필 정보를 가져오는데 실패했습니다.' });
  }
};

// 닉네임 중복 검사 함수
const checkNickname = async () => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/v1/member/check-nickname?nickname=${editNickname.value}`
    );
    if (response.data === true) {
      nicknameError.value = '이미 사용 중인 닉네임입니다.';
      nicknameMessage.value = ''; // 성공 메시지 초기화
    } else {
      nicknameError.value = ''; // 오류 메시지 초기화
      nicknameMessage.value = '사용 가능한 닉네임입니다.'; // 사용 가능 메시지 표시
    }
  } catch (error) {
    nicknameError.value = '닉네임 중복 검사 중 오류가 발생했습니다.';
    nicknameMessage.value = ''; // 성공 메시지 초기화
  }
};

// 닉네임 검증 규칙
const nicknameRules = [
  (val) => !!val || '닉네임을 입력하세요',
  () => !nicknameError.value || nicknameError.value
];

// 프로필 수정 모달 열기
const openEditDialog = () => {
  isEditDialogOpen.value = true;
};

// 프로필 수정 모달 닫기
const closeEditDialog = () => {
  isEditDialogOpen.value = false;
};

// 프로필 사진 변경
const onProfilePictureChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 파일을 선택하면 미리보기 URL을 생성하여 바로 반영
  profilePictureUrl.value = URL.createObjectURL(file);

  // 선택된 파일을 관리하는 변수에 저장
  files.value = [file];
};

// 프로필 저장
const saveProfile = async () => {
  if (nicknameError.value) {
    $q.notify({ type: 'negative', message: nicknameError.value });
    return;
  }

  const formData = new FormData();
  formData.append('nickname', editNickname.value); // 닉네임 추가

  // 선택된 프로필 사진이 있으면 추가
  if (files.value && files.value.length > 0) {
    formData.append('image', files.value[0]); // 파일 추가
  }

  try {
    const response = await axios.put('http://localhost:8080/api/v1/member/profile', formData, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    // 닉네임 및 프로필 사진 업데이트
    nickname.value = editNickname.value;
    profilePictureUrl.value = `http://localhost:8080/api/v1/member/image/${response.data.memberImageUrl}`;

    // 상단바 이미지 URL도 업데이트
    localStorage.setItem('userImageUrl', response.data.memberImageUrl);

    $q.notify({ type: 'positive', message: '프로필 정보가 성공적으로 저장되었습니다!' });

    // 프로필 정보 재로딩
    await loadProfile();
    closeEditDialog();

    // 상단바 프로필 이미지 즉시 갱신
    window.location.reload(); // 새로고침하여 상단바 이미지 즉시 반영
  } catch (error) {
    $q.notify({ type: 'negative', message: '프로필 저장 중 오류가 발생했습니다.' });
  }
};

onMounted(() => {
  loadProfile();
});
</script>
