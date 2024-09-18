<template>
  <link
    href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons"
    rel="stylesheet"
    type="text/css"
  />
  <div class="q-gutter-md row items-center">
    <q-select
      v-model="localSearchOption"
      :options="searchOptions"
      map-options
      emit-value
      class="col-3"
    />

    <q-input v-model="localQuery" placeholder="검색어 입력" class="col" dense />

    <q-btn label="검색" color="primary" class="col-auto" @click="performSearch" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

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

const localSearchOption = ref(props.initialSearchOption);
const localQuery = ref(props.initialSearchQuery);

const emit = defineEmits(['search-results']);

const performSearch = () => {
  sessionStorage.setItem('searchOption', localSearchOption.value);
  sessionStorage.setItem('searchQuery', localQuery.value);

  emit('search-results', localSearchOption.value, localQuery.value, 1);
};

watch(
  () => props.initialSearchQuery,
  (newQuery) => {
    localQuery.value = newQuery;
  }
);

watch(
  () => props.initialSearchOption,
  (newOption) => {
    localSearchOption.value = newOption;
  }
);
</script>
