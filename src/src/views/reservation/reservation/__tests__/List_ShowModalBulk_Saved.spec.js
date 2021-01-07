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
            apiService.getReservationList = promiseMocker.mockResolved(loadMainResult)
            apiService.getSchedulePlaceList = promiseMocker.mockResolved(loadPlaceListResult)
            apiService.getReservationStatusList = promiseMocker.mockResolved(loadReservationStatusListResult)
            getModalBulkWrapper(wrapper).vm.$emit('save')
          })

          test('Processingカバー表示開始', () => {
            expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
          })

          test('メインデータ取得処理を呼出', () => {
            expect(apiService.getReservationList).toHaveBeenCalled()
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
  })
})
