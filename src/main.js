// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:3000'

const app = createApp(App)

app.config.globalProperties.$axios = axios

document.title = "Task Tree"
app.mount('#app')