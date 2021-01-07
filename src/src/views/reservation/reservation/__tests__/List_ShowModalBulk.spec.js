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

const getChkAllWrapper = wrapper => wrapper.find('input.chk-all')
const getChkWrapper = (wrapper, id) => wrapper.find(`input.chk-${id}`)
const getBtnBulkShowHeaderWrapper = wrapper => wrapper.find('button.btn-bulk-show-header')
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

    describe('選択なし', () => {
      beforeEach(async () => {
        const chkAllWrapper = getChkAllWrapper(wrapper)
        await chkAllWrapper.setChecked(true)
        await chkAllWrapper.setChecked(false)
      })

      describe.each([
        ['ヘッダー', getBtnBulkShowHeaderWrapper],
        ['フッター', getBtnBulkShowFooterWrapper]
      ])('一括変更ボタン（%s）クリック', (btnName, getBtnWrapper) => {
        beforeEach(async () => {
          await getBtnWrapper(wrapper).trigger('click')
        })

        test('アラートクリア', () => {
          expect(storeModules.alert.mutations.clear).toHaveBeenCalled()
        })

        test('選択必須アラート表示', () => {
          expect(storeModules.alert.actions.selectRequired).toHaveBeenCalled()
        })

        test('一括変更モーダルは表示しない', () => {
          expect(getModalBulkWrapper(wrapper).props().show).toBeFalsy()
        })
      })
    })

    describe('全て選択', () => {
      beforeEach(async () => {
        const chkAllWrapper = getChkAllWrapper(wrapper)
        await chkAllWrapper.setChecked(true)
      })

      describe.each([
        ['ヘッダー', getBtnBulkShowHeaderWrapper],
        ['フッター', getBtnBulkShowFooterWrapper]
      ])('一括変更ボタン（%s）クリック', (btnName, getBtnWrapper) => {
        beforeEach(async () => {
          await getBtnWrapper(wrapper).trigger('click')
        })

        test('アラートクリア', () => {
          expect(storeModules.alert.mutations.clear).toHaveBeenCalled()
        })

        test('選択必須アラートは表示しない', () => {
          expect(storeModules.alert.actions.selectRequired).not.toHaveBeenCalled()
        })

        test('一括変更モーダル表示', () => {
          expect(getModalBulkWrapper(wrapper).props().show).toBeTruthy()
        })

        test('一括変更対象', () => {
          expect(getModalBulkWrapper(wrapper).props().items).toEqual(loadMainResult)
        })
      })
    })

    describe('一部選択', () => {
      let itemsToBulk
      beforeEach(async () => {
        itemsToBulk = loadMainResult.slice(1, 4)
        itemsToBulk.forEach(async item => {
          await getChkWrapper(wrapper, item.id).setChecked(true)
        })
      })

      describe.each([
        ['ヘッダー', getBtnBulkShowHeaderWrapper],
        ['フッター', getBtnBulkShowFooterWrapper]
      ])('一括変更ボタン（%s）クリック', (btnName, getBtnWrapper) => {
        beforeEach(async () => {
          await getBtnWrapper(wrapper).trigger('click')
        })

        test('アラートクリア', () => {
          expect(storeModules.alert.mutations.clear).toHaveBeenCalled()
        })

        test('選択必須アラートは表示しない', () => {
          expect(storeModules.alert.actions.selectRequired).not.toHaveBeenCalled()
        })

        test('一括変更モーダル表示', () => {
          expect(getModalBulkWrapper(wrapper).props().show).toBeTruthy()
        })

        test('一括変更対象', () => {
          expect(getModalBulkWrapper(wrapper).props().items).toEqual(itemsToBulk)
        })
      })
    })
  })
})
