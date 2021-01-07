import Edit from '../Edit'
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
const scheduleRecord = require('@/testUtils/dummyApiData/schedule/get.json')
const reservationRecordList = require('@/testUtils/dummyApiData/reservation/list-for-schedule-split.json')
const id = scheduleRecord.id
const makeFormArgs = {
  ymd: scheduleRecord.ymd,
  begins_at: scheduleRecord.begins_at,
  ends_at: scheduleRecord.ends_at,
  schedule_place_id: scheduleRecord.schedule_place_id,
  schedule_usage_id: scheduleRecord.schedule_usage_id,
  schedule_timetable_id: scheduleRecord.schedule_timetable_id,
  schedule_status_id: scheduleRecord.schedule_status_id,
  reservation_list: reservationRecordList.map(record => ({
    id: record.id,
    begins_at: record.begins_at,
    ends_at: record.ends_at,
    reservation_status_id: record.reservation_status_id
  }))
}
const saveResult = require('@/testUtils/dummyApiData/common/update.json')
saveResult.id = id

describe('Edit', () => {
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
    let loadScheduleStatusListSwitch
    let loadReservationStatusListSwitch
    let loadScheduleRecordSwitch
    let loadReservationRecordListSwitch
    beforeEach(async () => {
      loadError = new Error('load')
      loadPlaceListSwitch = promiseMocker.createSwitch()
      loadUsageListSwitch = promiseMocker.createSwitch()
      loadTimetableListSwitch = promiseMocker.createSwitch()
      loadScheduleStatusListSwitch = promiseMocker.createSwitch()
      loadReservationStatusListSwitch = promiseMocker.createSwitch()
      loadScheduleRecordSwitch = promiseMocker.createSwitch()
      loadReservationRecordListSwitch = promiseMocker.createSwitch()
      apiService.getSchedulePlaceList = promiseMocker.mock(placeList, loadError, loadPlaceListSwitch)
      apiService.getScheduleUsageList = promiseMocker.mock(usageList, loadError, loadUsageListSwitch)
      apiService.getScheduleTimetableList = promiseMocker.mock(timetableList, loadError, loadTimetableListSwitch)
      apiService.getScheduleStatusList = promiseMocker.mock(scheduleStatusList, loadError, loadScheduleStatusListSwitch)
      apiService.getReservationStatusList = promiseMocker.mock(reservationStatusList, loadError, loadReservationStatusListSwitch)
      apiService.getSchedule = promiseMocker.mock(scheduleRecord, loadError, loadScheduleRecordSwitch)
      apiService.getReservationListForSchedule = promiseMocker.mock(reservationRecordList, loadError, loadReservationRecordListSwitch)

      wrapper = await pageTester.mount(Edit, { name: 'reservation.schedule.edit', params: { id } }, mountOption)
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
      ['公開ステータス', apiService => apiService.getScheduleStatusList],
      ['予約ステータス', apiService => apiService.getReservationStatusList]
    ])('%sマスタ取得処理を呼出', (masterName, getApiMethodToAssert) => {
      expect(getApiMethodToAssert(apiService)).toHaveBeenCalledWith()
    })

    test('予定レコード取得処理を呼出', () => {
      expect(apiService.getSchedule).toHaveBeenCalledWith(id)
    })

    test('予約レコード取得処理を呼出', () => {
      expect(apiService.getReservationListForSchedule).toHaveBeenCalledWith(id)
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
      ['公開ステータスマスタ'],
      ['予約ステータスマスタ'],
      ['予定レコード'],
      ['予約レコード']
    ])('%s取得：エラー', (dataName) => {
      beforeEach(() => {
        const loadSwitch =
          dataName === '場所マスタ' ? loadPlaceListSwitch
            : dataName === '用途マスタ' ? loadUsageListSwitch
              : dataName === '時間割マスタ' ? loadTimetableListSwitch
                : dataName === '公開ステータスマスタ' ? loadScheduleStatusListSwitch
                  : dataName === '予約ステータスマスタ' ? loadReservationStatusListSwitch
                    : dataName === '予定レコード' ? loadScheduleRecordSwitch
                      : dataName === '予約レコード' ? loadReservationRecordListSwitch
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

      describe('URL変更', () => {
        let newId
        beforeEach(() => {
          newId = id + 1
          apiService.getSchedulePlaceList = promiseMocker.mockResolved(placeList)
          apiService.getScheduleUsageList = promiseMocker.mockResolved(usageList)
          apiService.getScheduleTimetableList = promiseMocker.mockResolved(timetableList)
          apiService.getScheduleStatusList = promiseMocker.mockResolved(scheduleStatusList)
          apiService.getReservationStatusList = promiseMocker.mockResolved(reservationStatusList)
          apiService.getSchedule = promiseMocker.mockResolved(scheduleRecord)
          apiService.getReservationListForSchedule = promiseMocker.mockResolved(reservationRecordList)

          storeModules.processing.mutations.beginGet.mockReset()
          storeModules.processing.mutations.endGet.mockReset()
          wrapper.setProps({ id: newId })
        })

        test('Processingカバー表示開始', () => {
          expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
        })

        test.each([
          ['場所', apiService => apiService.getSchedulePlaceList],
          ['用途', apiService => apiService.getScheduleUsageList],
          ['時間割', apiService => apiService.getScheduleTimetableList],
          ['公開ステータス', apiService => apiService.getScheduleStatusList],
          ['予約ステータス', apiService => apiService.getReservationStatusList]
        ])('%sマスタ取得処理は呼び出さない', (masterName, getApiMethodToAssert) => {
          expect(getApiMethodToAssert(apiService)).not.toHaveBeenCalled()
        })

        test('予定レコード取得処理を呼出', () => {
          expect(apiService.getSchedule).toHaveBeenCalledWith(newId)
        })

        test('予約レコード取得処理を呼出', () => {
          expect(apiService.getReservationListForSchedule).toHaveBeenCalledWith(newId)
        })

        test('Processingカバー表示中', () => {
          expect(
            storeModules.processing.mutations.endGet
          ).not.toHaveBeenCalled()
        })
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
          apiService.updateSchedule = promiseMocker.mock(saveResult, saveError, saveSwitch)
          wrapper.find('form').trigger('submit')
        })

        test('Processingカバー表示開始', () => {
          expect(storeModules.processing.mutations.beginPost).toHaveBeenCalled()
        })

        test('アラートクリア', () => {
          expect(storeModules.alert.mutations.clear).toHaveBeenCalled()
        })

        test('保存処理を呼出', () => {
          expect(apiService.updateSchedule).toHaveBeenCalledWith(id, form)
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

          test('フォーム初期値更新は呼び出さない', () => {
            expect(form.setInit).not.toHaveBeenCalled()
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

          test('フォーム初期値更新', () => {
            expect(form.setInit).toHaveBeenCalledWith()
          })

          test('Processingカバー表示終了', () => {
            expect(storeModules.processing.mutations.endPost).toHaveBeenCalled()
          })
        })
      })
    })
  })
})
