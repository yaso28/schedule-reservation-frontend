import AddList from '../AddList'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'
import myFormMocker from '@/testUtils/myFormMocker'

jest.mock('@/store/modules')
jest.mock('@/models/MyForm')

const placeList = require('@/testUtils/dummyApiData/schedule-place/list.json')
const usageList = require('@/testUtils/dummyApiData/schedule-usage/list.json')
const timetableList = require('@/testUtils/dummyApiData/schedule-timetable/list.json')
const scheduleStatusList = require('@/testUtils/dummyApiData/schedule-status/list.json')
const reservationStatusList = require('@/testUtils/dummyApiData/reservation-status/list.json')
const makeFormArgs = {
  ymd_list: [],
  begins_at: '',
  ends_at: '',
  schedule_place_id: null,
  schedule_usage_id: null,
  schedule_timetable_id: null,
  reservation_status_id: null,
  schedule_status_id: null
}

describe('AddList', () => {
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

  describe('マウント', () => {
    let wrapper
    let loadError
    let loadPlaceListSwitch
    let loadUsageListSwitch
    let loadTimetableListSwitch
    let loadReservationStatusListSwitch
    let loadScheduleStatusListSwitch
    beforeEach(async () => {
      loadError = new Error('load')
      loadPlaceListSwitch = promiseMocker.createSwitch()
      loadUsageListSwitch = promiseMocker.createSwitch()
      loadTimetableListSwitch = promiseMocker.createSwitch()
      loadReservationStatusListSwitch = promiseMocker.createSwitch()
      loadScheduleStatusListSwitch = promiseMocker.createSwitch()
      apiService.getSchedulePlaceList = promiseMocker.mock(placeList, loadError, loadPlaceListSwitch)
      apiService.getScheduleUsageList = promiseMocker.mock(usageList, loadError, loadUsageListSwitch)
      apiService.getScheduleTimetableList = promiseMocker.mock(timetableList, loadError, loadTimetableListSwitch)
      apiService.getReservationStatusList = promiseMocker.mock(reservationStatusList, loadError, loadReservationStatusListSwitch)
      apiService.getScheduleStatusList = promiseMocker.mock(scheduleStatusList, loadError, loadScheduleStatusListSwitch)

      wrapper = await pageTester.mount(AddList, { name: 'reservation.schedule.add-list' }, mountOption)
    })

    test('titleタグ', () => {
      pageTester.assertTitleTag()
    })

    test('metaタグ', () => {
      pageTester.assertMetaTags()
    })

    test('Processingカバー表示開始', () => {
      expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
    })

    test.each([
      ['場所', apiService => apiService.getSchedulePlaceList],
      ['用途', apiService => apiService.getScheduleUsageList],
      ['時間割', apiService => apiService.getScheduleTimetableList],
      ['予約ステータス', apiService => apiService.getReservationStatusList],
      ['公開ステータス', apiService => apiService.getScheduleStatusList]
    ])('%sマスタ取得処理を呼出', (masterName, getApiMethodToAssert) => {
      expect(getApiMethodToAssert(apiService)).toHaveBeenCalledWith()
    })

    test('Processingカバー表示中', () => {
      expect(
        storeModules.processing.mutations.endGet
      ).not.toHaveBeenCalled()
    })

    describe.each([
      ['場所マスタ'],
      ['用途マスタ'],
      ['時間割マスタ'],
      ['予約ステータスマスタ'],
      ['公開ステータスマスタ']
    ])('%s取得：エラー', (dataName) => {
      beforeEach(() => {
        const loadSwitch =
          dataName === '場所マスタ' ? loadPlaceListSwitch
            : dataName === '用途マスタ' ? loadUsageListSwitch
              : dataName === '時間割マスタ' ? loadTimetableListSwitch
                : dataName === '予約ステータスマスタ' ? loadReservationStatusListSwitch
                  : dataName === '公開ステータスマスタ' ? loadScheduleStatusListSwitch
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
      let form
      beforeEach(() => {
        form = myFormMocker.createMock(makeFormArgs)
        apiService.makeForm = jest.fn().mockReturnValueOnce(form)
        promiseMocker.flushPendings()
      })

      test('フォーム作成', () => {
        expect(apiService.makeForm).toHaveBeenCalledWith(makeFormArgs)
      })

      test('ページ全体表示', () => {
        expect(wrapper.element).toMatchSnapshot()
      })

      test('Processingカバー表示終了', () => {
        expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
      })

      describe('リセットボタンクリック', () => {
        beforeEach(() => {
          wrapper.find('button.btn-reset').trigger('click')
        })

        test('フォームリセット', () => {
          expect(form.reset).toHaveBeenCalledWith()
        })
      })

      describe('フォーム送信', () => {
        let saveError
        let saveSwitch
        beforeEach(() => {
          saveError = new Error('save')
          saveSwitch = promiseMocker.createSwitch()
          apiService.addScheduleList = promiseMocker.mock(null, saveError, saveSwitch)
          wrapper.find('form').trigger('submit')
        })

        test('Processingカバー表示開始', () => {
          expect(storeModules.processing.mutations.beginPost).toHaveBeenCalled()
        })

        test('アラートクリア', () => {
          expect(storeModules.alert.mutations.clear).toHaveBeenCalled()
        })

        test('保存処理を呼出', () => {
          expect(apiService.addScheduleList).toHaveBeenCalledWith(form)
        })

        test('Processingカバー表示中', () => {
          expect(storeModules.processing.mutations.endPost).not.toHaveBeenCalled()
        })

        describe('保存：エラー', () => {
          beforeEach(() => {
            promiseMocker.setSwitch(saveSwitch, false)
            apiService.isHandledError = jest.fn().mockReturnValueOnce(true)
            promiseMocker.flushPendings()
          })

          test('エラー処理', () => {
            expect(apiService.isHandledError).toHaveBeenCalledWith(saveError)
          })

          test('Processingカバー表示終了', () => {
            expect(storeModules.processing.mutations.endPost).toHaveBeenCalled()
          })

          test('成功アラートは呼び出さない', () => {
            expect(storeModules.alert.actions.saveSuccessNoRedirect).not.toHaveBeenCalled()
          })

          test('フォームリセットは呼び出さない', () => {
            expect(form.reset).not.toHaveBeenCalled()
          })
        })

        describe('保存：成功', () => {
          beforeEach(() => {
            promiseMocker.setSwitch(saveSwitch, true)
            promiseMocker.flushPendings()
          })

          test('成功アラート', () => {
            expect(storeModules.alert.actions.saveSuccessNoRedirect).toHaveBeenCalled()
          })

          test('フォームリセット', () => {
            expect(form.reset).toHaveBeenCalledWith()
          })

          test('Processingカバー表示終了', () => {
            expect(storeModules.processing.mutations.endPost).toHaveBeenCalled()
          })
        })
      })
    })
  })
})
