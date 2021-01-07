import { createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import routes from '@/router/routes'
import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import i18nOptions from '@/i18n/options'
import VueMeta from 'vue-meta'
import CoreuiVue from '@coreui/vue'
import icons from '@/icons'
import services from '@/services'

class MountOptionCreator {
  create (storeModules = null) {
    const localVue = createLocalVue()

    // router
    localVue.use(VueRouter)
    const router = new VueRouter({
      mode: 'history',
      base: process.env.BASE_URL,
      routes
    })

    // i18n
    localVue.use(VueI18n)
    const i18n = new VueI18n(i18nOptions)

    // vue-meta
    localVue.use(VueMeta)

    // Core UI
    localVue.use(CoreuiVue)

    const option = {
      localVue,
      router,
      i18n,
      icons,
      provide: services
    }

    // store
    if (storeModules) {
      localVue.use(Vuex)
      option.store = new Vuex.Store({
        modules: storeModules
      })
    }

    return option
  }
}

export default new MountOptionCreator()
