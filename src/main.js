import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'quasar/dist/quasar.css'

import App from './App.vue'
import router from './router'
import { Notify, Quasar } from 'quasar'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: { Notify }
})

app.mount('#app')
