import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'flag-icons/css/flag-icons.min.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import i18n from './locales'
import router from './router'

// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faFlag, 
  faCircleUser, 
  faUsers, 
  faChevronDown,
  faPenToSquare,
  faRightFromBracket
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faFlag, 
  faCircleUser, 
  faUsers, 
  faChevronDown,
  faPenToSquare,
  faRightFromBracket
)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(i18n)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
