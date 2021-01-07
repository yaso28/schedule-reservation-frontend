import ApiService from '@/services/apiService/ApiService'
import apiResponseMocker from '@/testUtils/apiResponseMocker'
import promiseMocker from '@/testUtils/promiseMocker'
import axiosInstance from '@/services/axiosInstance'
import MyForm from '@/models/MyForm'

jest.mock('@/services/axiosInstance')
jest.mock('@/models/MyForm')

const dummyId = 3
const dummyApiData = {
  id: dummyId,
  name: 'DUMMY'
}
const dummyCategory = 'reservation'
const dummyKey = 'mail_to'
const dummyForm = new MyForm({}, axiosInstance)
const dummyApiResponse = apiResponseMocker.mockSuccess(dummyApiData)

describe('ApiService', () => {
  let apiService
  beforeEach(() => {
    promiseMocker.init()
    apiService = new ApiService(axiosInstance)
  })

  afterEach(() => {
    promiseMocker.clear()
    jest.resetAllMocks()
  })

  describe('addResponseInterceptor()', () => {
    const interceptorId = 3
    const onSuccess = () => { }
    const onError = () => Promise.reject(new Error())
    let result
    beforeEach(() => {
      axiosInstance.interceptors.response.use.mockReturnValueOnce(
        interceptorId
      )
      result = apiService.addResponseInterceptor(onSuccess, onError)
    })

    test('axiosInstanceにinceptorを渡す', () => {
      expect(axiosInstance.interceptors.response.use).toHaveBeenCalledWith(
        onSuccess,
        onError
      )
    })

    test('inceptor識別子を返す', () => {
      expect(result).toBe(interceptorId)
    })
  })

  describe('エラー処理マーク', () => {
    test('処理マーク付きは処理済と判定', () => {
      const error = new Error()
      apiService.setErrorHandled(error)
      expect(apiService.isHandledError(error)).toBe(true)
    })

    test('処理マーク無しは未処理と判定', () => {
      const error = new Error()
      expect(apiService.isHandledError(error)).toBe(false)
    })

    test('nullは未処理と判定', () => {
      expect(apiService.isHandledError(null)).toBe(false)
    })
  })

  describe('makeForm()', () => {
    const input = {
      name: '',
      description: ''
    }
    let result
    beforeEach(() => {
      result = apiService.makeForm(input)
    })

    test('MyFormにinputとaxiosInstanceを渡す', () => {
      expect(MyForm).toHaveBeenCalledWith(input, axiosInstance)
    })

    test('new MyForm()を返す', () => {
      expect(result).toBe(MyForm.mock.instances[0])
    })
  })

  describe('login()', () => {
    let csrfSwitch
    let csrfError
    let mainPromise
    beforeEach(() => {
      csrfSwitch = promiseMocker.createSwitch()
      csrfError = new Error('csrf')
      axiosInstance.get = promiseMocker.mock(true, csrfError, csrfSwitch)
      mainPromise = apiService.login(dummyForm)
    })

    test('csrf取得APIを呼出', () => {
      expect(axiosInstance.get).toHaveBeenCalledWith('/sanctum/csrf-cookie')
    })

    describe('csrf取得：失敗', () => {
      let result
      beforeEach(async () => {
        promiseMocker.setSwitch(csrfSwitch, false)
        try {
          promiseMocker.flushPendings()
          await mainPromise
        } catch (e) {
          result = e
        }
      })

      test('エラー投げる', () => {
        expect(result).toBe(csrfError)
      })

      test('MyForm.post()は呼ばない', () => {
        expect(dummyForm.post).not.toHaveBeenCalled()
      })
    })

    describe('csrf取得：成功', () => {
      let formPostSwitch
      let formPostError
      beforeEach(() => {
        promiseMocker.setSwitch(csrfSwitch, true)
        formPostSwitch = promiseMocker.createSwitch()
        formPostError = new Error('form post')
        dummyForm.post = promiseMocker.mock(
          dummyApiData,
          formPostError,
          formPostSwitch
        )
        promiseMocker.flushPendings()
      })

      test('MyForm.post()を呼出', () => {
        expect(dummyForm.post).toHaveBeenCalledWith('/api/v5k4pgi3-login')
      })

      describe('ログイン：失敗', () => {
        let result
        beforeEach(async () => {
          promiseMocker.setSwitch(formPostSwitch, false)
          try {
            promiseMocker.flushPendings()
            await mainPromise
          } catch (e) {
            result = e
          }
        })

        test('エラー投げる', () => {
          expect(result).toBe(formPostError)
        })
      })

      describe('ログイン：成功', () => {
        let result
        beforeEach(async () => {
          promiseMocker.setSwitch(formPostSwitch, true)
          promiseMocker.flushPendings()
          result = await mainPromise
        })

        test('ユーザーデータ取得', () => {
          expect(result).toBe(dummyApiData)
        })
      })
    })
  })

  describe('logout()', () => {
    let apiSwitch
    let apiError
    let mainPromise
    beforeEach(() => {
      apiSwitch = promiseMocker.createSwitch()
      apiError = new Error('api')
      axiosInstance.post = promiseMocker.mock(
        dummyApiResponse,
        apiError,
        apiSwitch
      )
      mainPromise = apiService.logout()
    })

    test('API呼出', () => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/api/logout')
    })

    describe('API：エラー', () => {
      let result
      beforeEach(async () => {
        promiseMocker.setSwitch(apiSwitch, false)
        try {
          promiseMocker.flushPendings()
          await mainPromise
        } catch (e) {
          result = e
        }
      })

      test('エラー投げる', () => {
        expect(result).toBe(apiError)
      })
    })

    describe('API：成功', () => {
      let result
      beforeEach(async () => {
        promiseMocker.setSwitch(apiSwitch, true)
        promiseMocker.flushPendings()
        result = await mainPromise
      })

      test('データ取得', () => {
        expect(result).toEqual(dummyApiData)
      })
    })
  })

  describe.each([
    ['getScheduleStatusList()', apiService => apiService.getScheduleStatusList(), '/api/schedule-status/list'],
    ['getReservationStatusList()', apiService => apiService.getReservationStatusList(), '/api/reservation-status/list'],
    ['getReservationOrganizationList()', apiService => apiService.getReservationOrganizationList(), '/api/reservation-organization/list'],
    ['getReservationOrganization()', apiService => apiService.getReservationOrganization(dummyId), `/api/reservation-organization/get/${dummyId}`],
    ['getSchedulePlaceList()', apiService => apiService.getSchedulePlaceList(), '/api/schedule-place/list'],
    ['getSchedulePlace()', apiService => apiService.getSchedulePlace(dummyId), `/api/schedule-place/get/${dummyId}`],
    ['getScheduleUsageList()', apiService => apiService.getScheduleUsageList(), '/api/schedule-usage/list'],
    ['getScheduleUsage()', apiService => apiService.getScheduleUsage(dummyId), `/api/schedule-usage/get/${dummyId}`],
    ['getScheduleTimetableList()', apiService => apiService.getScheduleTimetableList(), '/api/schedule-timetable/list'],
    ['getScheduleTimetable()', apiService => apiService.getScheduleTimetable(dummyId), `/api/schedule-timetable/get/${dummyId}`],
    ['getMonthList()', apiService => apiService.getMonthList(), '/api/month/list'],
    ['getMonthList()-Query-year', apiService => apiService.getMonthList(2020, undefined), '/api/month/list?year_from=2020'],
    ['getMonthList()-Query-month', apiService => apiService.getMonthList(undefined, 11), '/api/month/list?month_from=11'],
    ['getMonthList()-Query-year-month', apiService => apiService.getMonthList(2020, 11), '/api/month/list?year_from=2020&month_from=11'],
    ['getMonth()', apiService => apiService.getMonth(dummyId), `/api/month/get/${dummyId}`],
    ['prepareMonthScheduleSendInfo()', apiService => apiService.prepareMonthScheduleSendInfo(dummyId), `/api/month/send/prepare/${dummyId}`],
    ['getScheduleList()', apiService => apiService.getScheduleList(), '/api/schedule/list'],
    ['getScheduleList()-Query-from', apiService => apiService.getScheduleList('2020-01-01', undefined), '/api/schedule/list?from=2020-01-01'],
    ['getScheduleList()-Query-to', apiService => apiService.getScheduleList('', '2020-12-31'), '/api/schedule/list?to=2020-12-31'],
    ['getScheduleList()-Query-from-to', apiService => apiService.getScheduleList('2020-01-01', '2020-12-31'), '/api/schedule/list?from=2020-01-01&to=2020-12-31'],
    ['getScheduleListPublic()', apiService => apiService.getScheduleListPublic(), '/api/schedule/list/public'],
    ['getSchedule()', apiService => apiService.getSchedule(dummyId), `/api/schedule/get/${dummyId}`],
    ['getReservationList()', apiService => apiService.getReservationList(), '/api/reservation/list'],
    ['getReservationList()-Query-from', apiService => apiService.getReservationList('2020-01-01', ''), '/api/reservation/list?from=2020-01-01'],
    ['getReservationList()-Query-to', apiService => apiService.getReservationList(undefined, '2020-12-31'), '/api/reservation/list?to=2020-12-31'],
    ['getReservationList()-Query-from-to', apiService => apiService.getReservationList('2020-01-01', '2020-12-31'), '/api/reservation/list?from=2020-01-01&to=2020-12-31'],
    ['getReservationListForSchedule()', apiService => apiService.getReservationListForSchedule(dummyId), `/api/reservation/list-for-schedule/${dummyId}`],
    ['getReservation()', apiService => apiService.getReservation(dummyId), `/api/reservation/get/${dummyId}`],
    ['getSetting()', apiService => apiService.getSetting(dummyCategory, dummyKey), `/api/setting/get/${dummyCategory}/${dummyKey}`]
  ])('%s', (testName, action, expectedUrl) => {
    let apiSwitch
    let apiError
    let mainPromise
    beforeEach(() => {
      apiSwitch = promiseMocker.createSwitch()
      apiError = new Error('api')
      axiosInstance.get = promiseMocker.mock(
        dummyApiResponse,
        apiError,
        apiSwitch
      )
      mainPromise = action(apiService)
    })

    test('API呼出', () => {
      expect(axiosInstance.get).toHaveBeenCalledWith(expectedUrl)
    })

    describe('API：エラー', () => {
      let result
      beforeEach(async () => {
        promiseMocker.setSwitch(apiSwitch, false)
        try {
          promiseMocker.flushPendings()
          await mainPromise
        } catch (e) {
          result = e
        }
      })

      test('エラー投げる', () => {
        expect(result).toBe(apiError)
      })
    })

    describe('API：成功', () => {
      let result
      beforeEach(async () => {
        promiseMocker.setSwitch(apiSwitch, true)
        promiseMocker.flushPendings()
        result = await mainPromise
      })

      test('データ取得', () => {
        expect(result).toEqual(dummyApiData)
      })
    })
  })

  describe.each([
    ['addReservationOrganization()', apiService => apiService.addReservationOrganization(dummyForm), '/api/reservation-organization/add'],
    ['updateReservationOrganization()', apiService => apiService.updateReservationOrganization(dummyId, dummyForm), `/api/reservation-organization/update/${dummyId}`],
    ['reorderReservationOrganization()', apiService => apiService.reorderReservationOrganization(dummyForm), '/api/reservation-organization/reorder'],
    ['addSchedulePlace()', apiService => apiService.addSchedulePlace(dummyForm), '/api/schedule-place/add'],
    ['updateSchedulePlace()', apiService => apiService.updateSchedulePlace(dummyId, dummyForm), `/api/schedule-place/update/${dummyId}`],
    ['reorderSchedulePlace()', apiService => apiService.reorderSchedulePlace(dummyForm), '/api/schedule-place/reorder'],
    ['addScheduleUsage()', apiService => apiService.addScheduleUsage(dummyForm), '/api/schedule-usage/add'],
    ['updateScheduleUsage()', apiService => apiService.updateScheduleUsage(dummyId, dummyForm), `/api/schedule-usage/update/${dummyId}`],
    ['reorderScheduleUsage()', apiService => apiService.reorderScheduleUsage(dummyForm), '/api/schedule-usage/reorder'],
    ['addScheduleTimetable()', apiService => apiService.addScheduleTimetable(dummyForm), '/api/schedule-timetable/add'],
    ['updateScheduleTimetable()', apiService => apiService.updateScheduleTimetable(dummyId, dummyForm), `/api/schedule-timetable/update/${dummyId}`],
    ['reorderScheduleTimetable()', apiService => apiService.reorderScheduleTimetable(dummyForm), '/api/schedule-timetable/reorder'],
    ['sendMonthSchedule()', apiService => apiService.sendMonthSchedule(dummyId, dummyForm), `/api/month/send/${dummyId}`],
    ['addScheduleList()', apiService => apiService.addScheduleList(dummyForm), '/api/schedule/add-list'],
    ['updateSchedule()', apiService => apiService.updateSchedule(dummyId, dummyForm), `/api/schedule/update/${dummyId}`],
    ['bulkChangeSchedule()', apiService => apiService.bulkChangeSchedule(dummyForm), '/api/schedule/bulk-change'],
    ['splitReservation()', apiService => apiService.splitReservation(dummyId, dummyForm), `/api/reservation/split/${dummyId}`],
    ['bulkChangeReservation()', apiService => apiService.bulkChangeReservation(dummyForm), '/api/reservation/bulk-change'],
    ['updateSetting()', apiService => apiService.updateSetting(dummyCategory, dummyKey, dummyForm), `/api/setting/update/${dummyCategory}/${dummyKey}`]
  ])('%s', (testName, action, expectedUrl) => {
    let formPostSwitch
    let formPostError
    let mainPromise
    beforeEach(() => {
      formPostSwitch = promiseMocker.createSwitch()
      formPostError = new Error('form post')
      dummyForm.post = promiseMocker.mock(
        dummyApiData,
        formPostError,
        formPostSwitch
      )
      mainPromise = action(apiService)
    })

    test('MyForm.post()を呼出', () => {
      expect(dummyForm.post).toHaveBeenCalledWith(expectedUrl)
    })

    describe('API：失敗', () => {
      let result
      beforeEach(async () => {
        promiseMocker.setSwitch(formPostSwitch, false)
        try {
          promiseMocker.flushPendings()
          await mainPromise
        } catch (e) {
          result = e
        }
      })

      test('エラー投げる', () => {
        expect(result).toBe(formPostError)
      })
    })

    describe('API：成功', () => {
      let result
      beforeEach(async () => {
        promiseMocker.setSwitch(formPostSwitch, true)
        promiseMocker.flushPendings()
        result = await mainPromise
      })

      test('データ取得', () => {
        expect(result).toBe(dummyApiData)
      })
    })
  })
})
