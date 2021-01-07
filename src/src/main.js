import Vue from 'vue'

// router
import router from '@/router'

// store
import store from '@/store'

// i18n
import i18n from '@/i18n'

// vue-meta
import VueMeta from 'vue-meta'

// Core UI
import CoreuiVue from '@coreui/vue'

// icons
import icons from '@/icons'

// dependency injection
import services from '@/services'

// middlewares
import middlewares from '@/middlewares'

// main
import App from '@/App.vue'
middlewares.set()
Vue.use(VueMeta)
Vue.config.productionTip = false
Vue.use(CoreuiVue)
new Vue({
  router,
  store,
  i18n,
  icons,
  provide: () => services,
  render: h => h(App)
}).$mount('#app')
