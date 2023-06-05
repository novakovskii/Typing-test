import { createApp } from 'vue'
import App from './App.vue'
import WaveUI from 'wave-ui/src/wave-ui'
import '@mdi/font/css/materialdesignicons.min.css'

const app = createApp(App)

app.use(WaveUI, {
    theme: 'dark'
})

app.mount('#app')