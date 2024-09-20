import './assets/css/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPersistedState from 'pinia-plugin-persistedstate';
import 'quasar/dist/quasar.css';

import App from './App.vue';
import router from './router';
import { Notify, Quasar } from 'quasar';

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPersistedState);
app.use(pinia);
app.use(router);
app.use(Quasar, {
  plugins: { Notify }
});

app.mount('#app');
