import httpInterceptor from './httpInterceptor'
import navigationGuard from './navigationGuard'

export default {
  set: () => {
    httpInterceptor.set()
    navigationGuard.set()
  }
}
