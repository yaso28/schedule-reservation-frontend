import List from '../List'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'
import myFormMocker from '@/testUtils/myFormMocker'
import setting from '@/consts/setting'
import { CModal } from '@coreui/vue'

jest.mock('@/store/modules')
jest.mock('@/models/MyForm')

const route = { name: 'schedule.list' }
const loadMainResult = require('@/testUtils/dummyApiData/schedule/list-public.json')
const loadUsageListResult = require('@/testUtils/dummyApiData/schedule-usage/list.json')
const loadPlaceListResult = require('@/testUtils/dummyApiData/schedule-place/list.json')
const loadScheduleStatusListResult = require('@/testUtils/dummyApiData/schedule-status/list.json')
const loadNotesResult = require('@/testUtils/dummyApiData/setting/get.json')

const makeFormFilterArgs = {
  ymdFrom: '',
  ymdTo: '',
  placeIdList: [],
  usageIdList: [],
  scheduleStatusIdList: []
}

const getBtnDetailsWrapper = (wrapper, id) => wrapper.find(`button.btn-details-${id}`)
const getModalWrapper = wrapper => wrapper.findComponent(CModal)

describe('List', () => {
  let mountOption
  let apiService
  beforeEach(() => {
    promiseMocker.init()
    mountOption = mountOptionCreator.create(storeModules)
    apiService = mountOption.provide.apiService
  })

  afterEach(() => {
    promiseMocker.clear()
    jest.resetAllMocks()
  })

  describe('通常', () => {
    beforeEach(() => {
      storeModules.auth.getters.can.mockReturnValue({})
    })

    describe('マウント', () => {
      let wrapper
      let formFilter
      let loadError
      let loadMainSwitch
      let loadUsageListSwitch
      let loadPlaceListSwitch
      let loadScheduleStatusListSwitch
      let loadNotesSwitch
      beforeEach(async () => {
        formFilter = myFormMocker.createMock(makeFormFilterArgs)
        apiService.makeForm = jest.fn().mockReturnValueOnce(formFilter)
        loadError = new Error('load')
        loadMainSwitch = promiseMocker.createSwitch()
        loadUsageListSwitch = promiseMocker.createSwitch()
        loadPlaceListSwitch = promiseMocker.createSwitch()
        loadScheduleStatusListSwitch = promiseMocker.createSwitch()
        loadNotesSwitch = promiseMocker.createSwitch()
        apiService.getScheduleListPublic = promiseMocker.mock(loadMainResult, loadError, loadMainSwitch)
        apiService.getScheduleUsageList = promiseMocker.mock(loadUsageListResult, loadError, loadUsageListSwitch)
        apiService.getSchedulePlaceList = promiseMocker.mock(loadPlaceListResult, loadError, loadPlaceListSwitch)
        apiService.getScheduleStatusList = promiseMocker.mock(loadScheduleStatusListResult, loadError, loadScheduleStatusListSwitch)
        apiService.getSetting = promiseMocker.mock(loadNotesResult, loadError, loadNotesSwitch)
        wrapper = await pageTester.mount(List, route, mountOption)
      })

      test('titleタグ', () => {
        pageTester.assertTitleTag()
      })

      test('metaタグ', () => {
        pageTester.assertMetaTags()
      })

      test('絞り込みフォーム作成', () => {
        expect(apiService.makeForm).toHaveBeenCalledWith(makeFormFilterArgs)
      })

      test('Processingカバー表示開始', () => {
        expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
      })

      test.each([
        ['メインデータ', apiService => apiService.getScheduleListPublic],
        ['用途マスタ', apiService => apiService.getScheduleUsageList],
        ['場所マスタ', apiService => apiService.getSchedulePlaceList],
        ['公開ステータスマスタ', apiService => apiService.getScheduleStatusList]
      ])('%s取得処理を呼出', (masterName, getApiMethodToAssert) => {
        expect(getApiMethodToAssert(apiService)).toHaveBeenCalledWith()
      })

      test('注意事項データ取得処理を呼出', () => {
        expect(apiService.getSetting).toHaveBeenCalledWith(setting.reservation_public.category, setting.reservation_public.notes)
      })

      test('Processingカバー表示中', () => {
        expect(storeModules.processing.mutations.endGet).not.toHaveBeenCalled()
      })

      describe.each([
        ['メインデータ'],
        ['用途マスタ'],
        ['場所マスタ'],
        ['公開ステータスマスタ'],
        ['注意事項データ']
      ])('%s取得：エラー', (dataName) => {
        beforeEach(() => {
          const loadSwitch =
            dataName === 'メインデータ' ? loadMainSwitch
              : dataName === '用途マスタ' ? loadUsageListSwitch
                : dataName === '場所マスタ' ? loadPlaceListSwitch
                  : dataName === '公開ステータスマスタ' ? loadScheduleStatusListSwitch
                    : dataName === '注意事項データ' ? loadNotesSwitch
                      : undefined
          promiseMocker.setSwitch(loadSwitch, false)
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

        describe('絞り込みリセットボタンクリック', () => {
          beforeEach(async () => {
            await wrapper.find('button.btn-filter-reset').trigger('click')
          })

          test('絞り込みフォームリセット', () => {
            expect(formFilter.reset).toHaveBeenCalledWith()
          })
        })

        describe('詳細ボタンクリック', () => {
          let scheduleForDetails
          beforeEach(async () => {
            scheduleForDetails = loadMainResult[2]
            await getBtnDetailsWrapper(wrapper, scheduleForDetails.id).trigger('click')
          })

          test('モーダル表示', () => {
            expect(getModalWrapper(wrapper).props().show).toBeTruthy()
          })

          test('モーダル全体表示', () => {
            expect(getModalWrapper(wrapper).element).toMatchSnapshot()
          })
        })
      })
    })
  })

  describe('注意事項：空', () => {
    let loadNotesResultEmpty
    beforeEach(() => {
      storeModules.auth.getters.can.mockReturnValue({})
      loadNotesResultEmpty = Object.assign({}, loadNotesResult)
      loadNotesResultEmpty.value = ''
    })

    describe('マウント', () => {
      let wrapper
      let formFilter
      beforeEach(async () => {
        formFilter = myFormMocker.createMock(makeFormFilterArgs)
        apiService.makeForm = jest.fn().mockReturnValueOnce(formFilter)
        apiService.getScheduleListPublic = promiseMocker.mockResolved(loadMainResult)
        apiService.getScheduleUsageList = promiseMocker.mockResolved(loadUsageListResult)
        apiService.getSchedulePlaceList = promiseMocker.mockResolved(loadPlaceListResult)
        apiService.getScheduleStatusList = promiseMocker.mockResolved(loadScheduleStatusListResult)
        apiService.getSetting = promiseMocker.mockResolved(loadNotesResultEmpty)
        wrapper = await pageTester.mount(List, route, mountOption)
        promiseMocker.flushPendings()
      })

      test('注意事項エリアは表示しない', () => {
        expect(wrapper.find('.my-notes').exists()).toBe(false)
      })
    })
  })
})
