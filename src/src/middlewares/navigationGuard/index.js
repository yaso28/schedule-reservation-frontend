import NavigationGuard from './NavigationGuard'
import router from '@/router'
import store from '@/store'

export default new NavigationGuard(router, store)
