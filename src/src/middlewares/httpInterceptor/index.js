import HttpInterceptor from './HttpInterceptor'
import apiService from '@/services/apiService'
import router from '@/router'
import store from '@/store'

export default new HttpInterceptor(apiService, router, store)
