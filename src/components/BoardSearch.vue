<template>
  <div>
    <!-- 검색 옵션 선택 -->
    <q-select
      v-model="localSearchOption"
      :options="searchOptions"
      label="검색 기준 선택"
      emit-value
      map-options
      class="q-mb-md"
    />

    <!-- 검색 입력란 -->
    <q-input v-model="localQuery" placeholder="검색어 입력" class="q-mb-md" />
    <q-btn label="검색" color="primary" class="q-mb-lg" @click="performSearch" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import useAxios from '@/services/axios.js';

// Props로 검색 옵션들을 받아옵니다.
const props = defineProps({
  searchOptions: {
    type: Array,
    required: true
  }
});

// 검색 옵션과 쿼리를 로컬 상태로 관리합니다.
const localSearchOption = ref('allSearch');
const localQuery = ref('');

// 부모에게 검색 결과를 전달하기 위한 emit 정의
const emit = defineEmits(['search-results']);

const performSearch = async () => {
  try {
    const params = {};
    console.log(localSearchOption);
    if (localSearchOption.value === 'title') {
      params.title = localQuery.value;
      console.log('title: ' + params.title);
    } else if (localSearchOption.value === 'content') {
      params.content = localQuery.value;
      console.log('content: ' + params.content);
    } else if (localSearchOption.value === 'writer') {
      params.memberNickname = localQuery.value;
      console.log('memberNickname: ' + params.memberNickname);
    } else if (localSearchOption.value === 'allSearch') {
      params.all = localQuery.value;
      console.log('allSearch: ' + params.all);
    }
    console.log('else:');

    // API 요청을 수행하여 검색 결과를 가져옵니다.
    const response = await useAxios({
      type: 'get',
      param: `board/search`,
      params: params
    });

    // 검색 결과를 부모 컴포넌트로 전달합니다.
    emit('search-results', response.data.boardList);
  } catch (error) {
    console.error('검색 실패:', error);
  }
};
</script>

<style scoped>
/* 필요한 경우 추가 스타일을 정의할 수 있습니다. */
</style>
