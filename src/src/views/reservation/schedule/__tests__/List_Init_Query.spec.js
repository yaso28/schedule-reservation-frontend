import List from '../List'
import ListModalBulkStub from './ListModalBulkStub'
import ListModalDetailsStub from './ListModalDetailsStub'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'
import myFormMocker from '@/testUtils/myFormMocker'
import permission from '@/consts/permission'

jest.mock('@/store/modules')
jest.mock('@/models/MyForm')

const route = { name: 'reservation.schedule.list' }
const loadMainResult = require('@/testUtils/dummyApiData/schedule/list.json')
const loadPlaceListResult = require('@/testUtils/dummyApiData/schedule-place/list.json')
const loadUsageListResult = require('@/testUtils/dummyApiData/schedule-usage/list.json')
const loadReservationStatusListResult = require('@/testUtils/dummyApiData/reservation-status/list.json')
const loadScheduleStatusListResult = require('@/testUtils/dummyApiData/schedule-status/list.json')

const createMakeFormYmdArgs = (ymdFrom, ymdTo) => ({ ymdFrom, ymdTo })
const makeFormFilterArgs = {
  placeIdList: [],
  usageIdList: [],
  reservationStatusIdList: [],
  scheduleStatusIdList: []
}

const setRouteQuery = function (route, from, to) {
  route.query = { from, to }
}

describe('List', () => {
  let mountOption
  let apiService
  beforeEach(() => {
    promiseMocker.init()
    mountOption = mountOptionCreator.create(storeModules)
    mountOption.stubs = {
      ListModalBulk: ListModalBulkStub,
      ListModalDetails: ListModalDetailsStub
    }
    apiService = mountOption.provide.apiService
    storeModules.auth.getters.can.mockReturnValue({ [permission.reservation.write]: true })
  })

  afterEach(() => {
    promiseMocker.clear()
    jest.resetAllMocks()
  })

  describe('マウント', () => {
    let formYmd
    let makeFormYmdArgs
    let formFilter
    let ymdFrom
    let ymdTo
    beforeEach(async () => {
      ymdFrom = '2020-11-01'
      ymdTo = '2020-11-30'
      makeFormYmdArgs = createMakeFormYmdArgs(ymdFrom, ymdTo)
      formYmd = myFormMocker.createMock(makeFormYmdArgs)
      formFilter = myFormMocker.createMock(makeFormFilterArgs)
      apiService.makeForm = jest.fn()
        .mockReturnValueOnce(formYmd)
        .mockReturnValueOnce(formFilter)
      apiService.getScheduleList = promiseMocker.mockResolved(loadMainResult)
      apiService.getSchedulePlaceList = promiseMocker.mockResolved(loadPlaceListResult)
      apiService.getScheduleUsageList = promiseMocker.mockResolved(loadUsageListResult)
      apiService.getReservationStatusList = promiseMocker.mockResolved(loadReservationStatusListResult)
      apiService.getScheduleStatusList = promiseMocker.mockResolved(loadScheduleStatusListResult)
      setRouteQuery(route, ymdFrom, ymdTo)
      await pageTester.mount(List, route, mountOption)
    })

    test('日付検索フォーム作成', () => {
      expect(apiService.makeForm).toHaveBeenNthCalledWith(1, makeFormYmdArgs)
    })

    test('絞り込みフォーム作成', () => {
      expect(apiService.makeForm).toHaveBeenNthCalledWith(2, makeFormFilterArgs)
    })

    test('Processingカバー表示開始', () => {
      expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
    })

    test('メインデータ取得処理を呼出', () => {
      expect(apiService.getScheduleList).toHaveBeenCalledWith(ymdFrom, ymdTo)
    })

    test('場所データ取得処理を呼出', () => {
      expect(apiService.getSchedulePlaceList).toHaveBeenCalledWith()
    })

    test('用途データ取得処理を呼出', () => {
      expect(apiService.getScheduleUsageList).toHaveBeenCalledWith()
    })

    test('予約ステータスデータ取得処理を呼出', () => {
      expect(apiService.getReservationStatusList).toHaveBeenCalledWith()
    })

    test('公開ステータス取得処理を呼出', () => {
      expect(apiService.getScheduleStatusList).toHaveBeenCalledWith()
    })

    test('Processingカバー表示中', () => {
      expect(storeModules.processing.mutations.endGet).not.toHaveBeenCalled()
    })

    describe('データ取得：成功', () => {
      beforeEach(() => {
        promiseMocker.flushPendings()
      })

      test('Processingカバー表示終了', () => {
        expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
      })

      describe('URL変更', () => {
        let newYmdFrom
        let newYmdTo
        beforeEach(() => {
          newYmdFrom = '2020-12-01'
          newYmdTo = '2020-12-31'
          makeFormYmdArgs = createMakeFormYmdArgs(newYmdFrom, newYmdTo)
          formYmd = myFormMocker.createMock(makeFormYmdArgs)
          formFilter = myFormMocker.createMock(makeFormFilterArgs)
          apiService.makeForm = jest.fn()
            .mockReturnValueOnce(formYmd)
            .mockReturnValueOnce(formFilter)
          storeModules.processing.mutations.beginGet.mockReset()
          storeModules.processing.mutations.endGet.mockReset()
          apiService.getScheduleList = promiseMocker.mockResolved(loadMainResult)
          apiService.getSchedulePlaceList = promiseMocker.mockResolved(loadPlaceListResult)
          apiService.getScheduleUsageList = promiseMocker.mockResolved(loadUsageListResult)
          apiService.getReservationStatusList = promiseMocker.mockResolved(loadReservationStatusListResult)
          apiService.getScheduleStatusList = promiseMocker.mockResolved(loadScheduleStatusListResult)
          setRouteQuery(route, newYmdFrom, newYmdTo)
          mountOption.router.push(route)
        })

        test('日付検索フォーム作成', () => {
          expect(apiService.makeForm).toHaveBeenNthCalledWith(1, makeFormYmdArgs)
        })

        test('絞り込みフォーム作成', () => {
          expect(apiService.makeForm).toHaveBeenNthCalledWith(2, makeFormFilterArgs)
        })

        test('Processingカバー表示開始', () => {
          expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
        })

        test('メインデータ取得処理を呼出', () => {
          expect(apiService.getScheduleList).toHaveBeenCalledWith(newYmdFrom, newYmdTo)
        })

        test('場所データ取得処理は呼び出さない', () => {
          expect(apiService.getSchedulePlaceList).not.toHaveBeenCalled()
        })

        test('用途データ取得処理は呼び出さない', () => {
          expect(apiService.getScheduleUsageList).not.toHaveBeenCalled()
        })

        test('予約ステータスデータ取得処理は呼び出さない', () => {
          expect(apiService.getReservationStatusList).not.toHaveBeenCalled()
        })

        test('公開ステータス取得処理は呼び出さない', () => {
          expect(apiService.getScheduleStatusList).not.toHaveBeenCalled()
        })

        test('Processingカバー表示中', () => {
          expect(storeModules.processing.mutations.endGet).not.toHaveBeenCalled()
        })
      })
    })
  })
})
