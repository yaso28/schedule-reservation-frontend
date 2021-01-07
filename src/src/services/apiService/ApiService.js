import MyForm from '@/models/MyForm'

export default class ApiService {
  #axiosInstance

  constructor (axiosInstance) {
    this.#axiosInstance = axiosInstance
  }

  // error handle begin

  addResponseInterceptor (onSuccess, onError) {
    return this.#axiosInstance.interceptors.response.use(onSuccess, onError)
  }

  setErrorHandled (error) {
    if (error) {
      error.apiServiceHandled = true
    }
    return error
  }

  isHandledError (error) {
    return error?.apiServiceHandled === true
  }

  // error handle end

  // common begin

  getResponseData (response) {
    return response?.data?.data ?? null
  }

  async get (url) {
    console.log(`CALLED: ApiService.get(${url})`)

    const response = await this.#axiosInstance.get(url)
    return this.getResponseData(response)
  }

  async post (url) {
    console.log(`CALLED: ApiService.post(${url})`)

    const response = await this.#axiosInstance.post(url)
    return this.getResponseData(response)
  }

  makeForm (input) {
    return new MyForm(input, this.#axiosInstance)
  }

  postForm (url, form) {
    return form.post(url)
  }

  makeQueryString (queryObject) {
    const queryArray = []
    Object.keys(queryObject).forEach((key) => {
      const value = queryObject[key]
      if (value === null || value === undefined || value === '') {
        return
      }
      queryArray.push(`${key}=${value}`)
    })
    if (queryArray.length === 0) {
      return ''
    }
    return `?${queryArray.join('&')}`
  }

  // common end

  // individual begin

  async login (form) {
    await this.get('/sanctum/csrf-cookie')
    return await this.postForm('/api/v5k4pgi3-login', form)
  }

  logout () {
    return this.post('/api/logout')
  }

  getScheduleStatusList () {
    return this.get('/api/schedule-status/list')
  }

  getReservationStatusList () {
    return this.get('/api/reservation-status/list')
  }

  getReservationOrganizationList () {
    return this.get('/api/reservation-organization/list')
  }

  getReservationOrganization (id) {
    return this.get(`/api/reservation-organization/get/${id}`)
  }

  addReservationOrganization (form) {
    return this.postForm('/api/reservation-organization/add', form)
  }

  updateReservationOrganization (id, form) {
    return this.postForm(`/api/reservation-organization/update/${id}`, form)
  }

  reorderReservationOrganization (form) {
    return this.postForm('/api/reservation-organization/reorder', form)
  }

  getSchedulePlaceList () {
    return this.get('/api/schedule-place/list')
  }

  getSchedulePlace (id) {
    return this.get(`/api/schedule-place/get/${id}`)
  }

  addSchedulePlace (form) {
    return this.postForm('/api/schedule-place/add', form)
  }

  updateSchedulePlace (id, form) {
    return this.postForm(`/api/schedule-place/update/${id}`, form)
  }

  reorderSchedulePlace (form) {
    return this.postForm('/api/schedule-place/reorder', form)
  }

  getScheduleUsageList () {
    return this.get('/api/schedule-usage/list')
  }

  getScheduleUsage (id) {
    return this.get(`/api/schedule-usage/get/${id}`)
  }

  addScheduleUsage (form) {
    return this.postForm('/api/schedule-usage/add', form)
  }

  updateScheduleUsage (id, form) {
    return this.postForm(`/api/schedule-usage/update/${id}`, form)
  }

  reorderScheduleUsage (form) {
    return this.postForm('/api/schedule-usage/reorder', form)
  }

  getScheduleTimetableList () {
    return this.get('/api/schedule-timetable/list')
  }

  getScheduleTimetable (id) {
    return this.get(`/api/schedule-timetable/get/${id}`)
  }

  addScheduleTimetable (form) {
    return this.postForm('/api/schedule-timetable/add', form)
  }

  updateScheduleTimetable (id, form) {
    return this.postForm(`/api/schedule-timetable/update/${id}`, form)
  }

  reorderScheduleTimetable (form) {
    return this.postForm('/api/schedule-timetable/reorder', form)
  }

  getMonthList (year_from = null, month_from = null) {
    const query = this.makeQueryString({ year_from, month_from })
    return this.get(`/api/month/list${query}`)
  }

  getMonth (id) {
    return this.get(`/api/month/get/${id}`)
  }

  prepareMonthScheduleSendInfo (id) {
    return this.get(`/api/month/send/prepare/${id}`)
  }

  sendMonthSchedule (id, form) {
    return this.postForm(`/api/month/send/${id}`, form)
  }

  getScheduleList (from = null, to = null) {
    const query = this.makeQueryString({ from, to })
    return this.get(`/api/schedule/list${query}`)
  }

  getScheduleListPublic () {
    return this.get('/api/schedule/list/public')
  }

  getSchedule (id) {
    return this.get(`/api/schedule/get/${id}`)
  }

  addScheduleList (form) {
    return this.postForm('/api/schedule/add-list', form)
  }

  updateSchedule (id, form) {
    return this.postForm(`/api/schedule/update/${id}`, form)
  }

  bulkChangeSchedule (form) {
    return this.postForm('/api/schedule/bulk-change', form)
  }

  getReservationList (from = null, to = null) {
    const query = this.makeQueryString({ from, to })
    return this.get(`/api/reservation/list${query}`)
  }

  getReservationListForSchedule (scheduleId) {
    return this.get(`/api/reservation/list-for-schedule/${scheduleId}`)
  }

  getReservation (id) {
    return this.get(`/api/reservation/get/${id}`)
  }

  splitReservation (id, form) {
    return this.postForm(`/api/reservation/split/${id}`, form)
  }

  bulkChangeReservation (form) {
    return this.postForm('/api/reservation/bulk-change', form)
  }

  getSetting (category, key) {
    return this.get(`/api/setting/get/${category}/${key}`)
  }

  updateSetting (category, key, form) {
    return this.postForm(`/api/setting/update/${category}/${key}`, form)
  }

  // individual end
}
