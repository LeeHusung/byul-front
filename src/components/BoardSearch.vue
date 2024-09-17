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
import { ref, onMounted, watch } from 'vue';
import useAxios from '@/services/axios.js';

const props = defineProps({
  searchOptions: {
    type: Array,
    required: true
  },
  initialSearchOption: {
    type: String,
    default: 'allSearch'
  },
  initialSearchQuery: {
    type: String,
    default: ''
  }
});

// 검색 옵션과 쿼리의 초기값 설정
const localSearchOption = ref(props.initialSearchOption);
const localQuery = ref(props.initialSearchQuery);

const emit = defineEmits(['search-results']);

const performSearch = async () => {
  try {
    const params = {};
    if (localSearchOption.value === 'title') {
      params.title = localQuery.value;
    } else if (localSearchOption.value === 'content') {
      params.content = localQuery.value;
    } else if (localSearchOption.value === 'writer') {
      params.memberNickname = localQuery.value;
    } else if (localSearchOption.value === 'allSearch') {
      params.all = localQuery.value;
    }

    // API 요청을 수행하여 검색 결과를 가져옵니다.
    const response = await useAxios({
      type: 'get',
      param: `board/search`,
      params: params
    });

    // 검색 옵션과 쿼리를 세션 스토리지에 저장
    sessionStorage.setItem('searchOption', localSearchOption.value);
    sessionStorage.setItem('searchQuery', localQuery.value);
    // 검색 결과 전체를 부모 컴포넌트로 전달합니다.
    emit('search-results', response.data, localSearchOption.value, localQuery.value);
  } catch (error) {
    console.error('검색 실패:', error);
  }
};

//검색 기록을 계속 검색 창에 남기게 하고 싶었는데, 계속 안됐다. 로그를 찍어보니 BoardSearch가 mount가 먼저돼어서 Board에서 mount할때 들어간 값이 BoardSearch에서는 아무 값도 안나오게됨.
//watch로 해결.
//watch란, 반응형 데이터의 변화를 감지하고 그에 대한 특정 작업을 수행할 수 있도록 하는 기능이다.
//첫 번째 인자는 감시할 반응형 데이터나 계산 속성이다. 함수나 데이터 자체를 전달할 수 있다.
//두 번째 인자는 데이터가 변경될 때 실행될 함수이다. 첫 번째 인자는 새로운 값, 두 번째 인자는 이전값이다.

//computed()로 하려고 하니 set()할때 props.~~ 가 에러난다. props는 읽기 전용이라 데이터 변경 불가능함.

watch(
  () => props.initialSearchQuery,
  (newQuery) => {
    localQuery.value = newQuery;
    console.log('updated localQuery:', localQuery.value);
  }
);

watch(
  () => props.initialSearchOption,
  (newOption) => {
    localSearchOption.value = newOption;
    console.log('Updated localSearchOption:', localSearchOption.value);
  }
);

onMounted(() => {
  localSearchOption.value = props.initialSearchOption;
  localQuery.value = props.initialSearchQuery;
  console.log(localQuery.value);
});
</script>
