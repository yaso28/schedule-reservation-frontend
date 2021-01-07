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

const getChkWrapper = (wrapper, id) => wrapper.find(`input.chk-${id}`)
const getBtnBulkShowFooterWrapper = wrapper => wrapper.find('button.btn-bulk-show-footer')
const getModalBulkWrapper = wrapper => wrapper.findComponent(ListModalBulkStub)

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
      apiService.getScheduleList = promiseMocker.mockResolved(loadMainResult)
      apiService.getSchedulePlaceList = promiseMocker.mockResolved(loadPlaceListResult)
      apiService.getScheduleUsageList = promiseMocker.mockResolved(loadUsageListResult)
      apiService.getReservationStatusList = promiseMocker.mockResolved(loadReservationStatusListResult)
      apiService.getScheduleStatusList = promiseMocker.mockResolved(loadScheduleStatusListResult)
      wrapper = await pageTester.mount(List, route, mountOption)
      promiseMocker.flushPendings()
    })

    describe('一部選択', () => {
      let itemsToBulk
      beforeEach(async () => {
        itemsToBulk = loadMainResult.slice(1, 4)
        itemsToBulk.forEach(async item => {
          await getChkWrapper(wrapper, item.id).setChecked(true)
        })
      })

      describe('一括変更ボタン（フッター）クリック', () => {
        beforeEach(async () => {
          await getBtnBulkShowFooterWrapper(wrapper).trigger('click')
        })

        describe('一括変更保存完了', () => {
          beforeEach(async () => {
            storeModules.processing.mutations.beginGet.mockReset()
            storeModules.processing.mutations.endGet.mockReset()
            apiService.getScheduleList = promiseMocker.mockResolved(loadMainResult)
            apiService.getSchedulePlaceList = promiseMocker.mockResolved(loadPlaceListResult)
            apiService.getScheduleUsageList = promiseMocker.mockResolved(loadUsageListResult)
            apiService.getReservationStatusList = promiseMocker.mockResolved(loadReservationStatusListResult)
            apiService.getScheduleStatusList = promiseMocker.mockResolved(loadScheduleStatusListResult)
            getModalBulkWrapper(wrapper).vm.$emit('save')
          })

          test('Processingカバー表示開始', () => {
            expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
          })

          test('メインデータ取得処理を呼出', () => {
            expect(apiService.getScheduleList).toHaveBeenCalled()
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
})
