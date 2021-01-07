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
  })

  afterEach(() => {
    promiseMocker.clear()
    jest.resetAllMocks()
  })

  describe('write権限：あり', () => {
    beforeEach(() => {
      storeModules.auth.getters.can.mockReturnValue({ [permission.reservation.write]: true })
    })

    describe('マウント', () => {
      let wrapper
      let formYmd
      let makeFormYmdArgs
      let formFilter
      let loadError
      let loadMainSwitch
      let loadPlaceListSwitch
      let loadReservationStatusListSwitch
      beforeEach(async () => {
        makeFormYmdArgs = createMakeFormYmdArgs('', '')
        formYmd = myFormMocker.createMock(makeFormYmdArgs)
        formFilter = myFormMocker.createMock(makeFormFilterArgs)
        apiService.makeForm = jest.fn()
          .mockReturnValueOnce(formYmd)
          .mockReturnValueOnce(formFilter)
        loadError = new Error('load')
        loadMainSwitch = promiseMocker.createSwitch()
        loadPlaceListSwitch = promiseMocker.createSwitch()
        loadReservationStatusListSwitch = promiseMocker.createSwitch()
        apiService.getReservationList = promiseMocker.mock(loadMainResult, loadError, loadMainSwitch)
        apiService.getSchedulePlaceList = promiseMocker.mock(loadPlaceListResult, loadError, loadPlaceListSwitch)
        apiService.getReservationStatusList = promiseMocker.mock(loadReservationStatusListResult, loadError, loadReservationStatusListSwitch)
        wrapper = await pageTester.mount(List, route, mountOption)
      })

      test('titleタグ', () => {
        pageTester.assertTitleTag()
      })

      test('metaタグ', () => {
        pageTester.assertMetaTags()
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
        expect(apiService.getReservationList).toHaveBeenCalledWith('', '')
      })

      test('場所データ取得処理を呼出', () => {
        expect(apiService.getSchedulePlaceList).toHaveBeenCalledWith()
      })

      test('予約ステータスデータ取得処理を呼出', () => {
        expect(apiService.getReservationStatusList).toHaveBeenCalledWith()
      })

      test('Processingカバー表示中', () => {
        expect(storeModules.processing.mutations.endGet).not.toHaveBeenCalled()
      })

      describe('メインデータ取得：エラー', () => {
        beforeEach(() => {
          promiseMocker.setSwitch(loadMainSwitch, false)
          apiService.isHandledError = jest.fn().mockReturnValueOnce(true)
          promiseMocker.flushPendings()
        })

        test('エラー処理', () => {
          expect(apiService.isHandledError).toHaveBeenCalledWith(loadError)
        })

        test('Processingカバー表示終了', () => {
          expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
        })
      })

      describe('場所データ取得：エラー', () => {
        beforeEach(() => {
          promiseMocker.setSwitch(loadPlaceListSwitch, false)
          apiService.isHandledError = jest.fn().mockReturnValueOnce(true)
          promiseMocker.flushPendings()
        })

        test('エラー処理', () => {
          expect(apiService.isHandledError).toHaveBeenCalledWith(loadError)
        })

        test('Processingカバー表示終了', () => {
          expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
        })
      })

      describe('予約ステータスデータ取得：エラー', () => {
        beforeEach(() => {
          promiseMocker.setSwitch(loadReservationStatusListSwitch, false)
          apiService.isHandledError = jest.fn().mockReturnValueOnce(true)
          promiseMocker.flushPendings()
        })

        test('エラー処理', () => {
          expect(apiService.isHandledError).toHaveBeenCalledWith(loadError)
        })

        test('Processingカバー表示終了', () => {
          expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
        })
      })

      describe('データ取得：成功', () => {
        beforeEach(() => {
          promiseMocker.flushPendings()
        })

        test('ページ全体表示', () => {
          expect(wrapper.element).toMatchSnapshot()
        })

        test('Processingカバー表示終了', () => {
          expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
        })
      })
    })
  })

  describe('write権限：なし', () => {
    beforeEach(() => {
      storeModules.auth.getters.can.mockReturnValue({})
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

      test('ヘッダーボタン表示', () => {
        expect(wrapper.find('div.header-buttons').element).toMatchSnapshot()
      })

      test('一覧アクション表示', () => {
        expect(wrapper.find('td.my-action').element).toMatchSnapshot()
      })

      test('フッターボタン表示', () => {
        expect(wrapper.find('div.footer-buttons').element).toMatchSnapshot()
      })
    })
  })
})
