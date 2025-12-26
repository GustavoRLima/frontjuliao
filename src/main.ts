import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'flag-icons/css/flag-icons.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import i18n from './locales'

// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faFlag } from '@fortawesome/free-solid-svg-icons'

library.add(faFlag)

const app = createApp(App)
app.use(i18n)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
