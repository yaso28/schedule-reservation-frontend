import List from '../List'
import ListModalBulkStub from './ListModalBulkStub'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'
import myFormMocker from '@/testUtils/myFormMocker'
import permission from '@/consts/permission'

jest.mock('@/store/modules')
jest.mock('@/models/MyForm')

const route = { name: 'reservation.reservation.list' }
const loadMainResult = require('@/testUtils/dummyApiData/reservation/list.json')
const loadPlaceListResult = require('@/testUtils/dummyApiData/schedule-place/list.json')
const loadReservationStatusListResult = require('@/testUtils/dummyApiData/reservation-status/list.json')

const createMakeFormYmdArgs = (ymdFrom, ymdTo) => ({ ymdFrom, ymdTo })
const makeFormFilterArgs = {
  placeIdList: [],
  reservationStatusIdList: []
}

const getBtnFilterResetWrapper = wrapper => wrapper.find('button.btn-filter-reset')
const getBtnSearchWrapper = wrapper => wrapper.find('button.btn-search')

describe('List', () => {
  let mountOption
  let apiService
  beforeEach(() => {
    promiseMocker.init()
    mountOption = mountOptionCreator.create(storeModules)
    mountOption.stubs = {
      ListModalBulk: ListModalBulkStub
    }
    apiService = mountOption.provide.apiService
    storeModules.auth.getters.can.mockReturnValue({ [permission.reservation.write]: true })
  })

  afterEach(() => {
    promiseMocker.clear()
    jest.resetAllMocks()
  })

  describe('マウント', () => {
    let wrapper
    let formYmd
    let makeFormYmdArgs
    let formFilter
    beforeEach(async () => {
      makeFormYmdArgs = createMakeFormYmdArgs('', '')
      formYmd = myFormMocker.createMock(makeFormYmdArgs)
      formFilter = myFormMocker.createMock(makeFormFilterArgs)
      apiService.makeForm = jest.fn()
        .mockReturnValueOnce(formYmd)
        .mockReturnValueOnce(formFilter)
      apiService.getReservationList = promiseMocker.mockResolved(loadMainResult)
      apiService.getSchedulePlaceList = promiseMocker.mockResolved(loadPlaceListResult)
      apiService.getReservationStatusList = promiseMocker.mockResolved(loadReservationStatusListResult)
      wrapper = await pageTester.mount(List, route, mountOption)
      promiseMocker.flushPendings()
    })

    describe('絞り込みリセットボタンクリック', () => {
      beforeEach(async () => {
        await getBtnFilterResetWrapper(wrapper).trigger('click')
      })

      test('絞り込みフォームリセット', () => {
        expect(formFilter.reset).toHaveBeenCalledWith()
      })
    })

    describe('日付検索', () => {
      let ymdFromValue
      let ymdToValue
      beforeEach(async () => {
        ymdFromValue = '2020-11-16'
        ymdToValue = '2020-11-20'
        formYmd.values.ymdFrom = ymdFromValue
        formYmd.values.ymdTo = ymdToValue
        storeModules.processing.mutations.beginGet.mockReset()
        storeModules.processing.mutations.endGet.mockReset()
        apiService.getReservationList = promiseMocker.mockResolved(loadMainResult)
        apiService.getSchedulePlaceList = promiseMocker.mockResolved(loadPlaceListResult)
        apiService.getReservationStatusList = promiseMocker.mockResolved(loadReservationStatusListResult)
        await getBtnSearchWrapper(wrapper).trigger('click')
      })

      test('Processingカバー表示開始', () => {
        expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
      })

      test('メインデータ取得処理を呼出', () => {
        expect(apiService.getReservationList).toHaveBeenCalledWith(ymdFromValue, ymdToValue)
      })

      test('場所データ取得処理は呼び出さない', () => {
        expect(apiService.getSchedulePlaceList).not.toHaveBeenCalled()
      })

      test('予約ステータスデータ取得処理は呼び出さない', () => {
        expect(apiService.getReservationStatusList).not.toHaveBeenCalled()
      })

      test('Processingカバー表示中', () => {
        expect(storeModules.processing.mutations.endGet).not.toHaveBeenCalled()
      })
    })
  })
})
