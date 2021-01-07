import ListModalDetails from '../ListModalDetails'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'
import { mount } from '@vue/test-utils'
import permission from '@/consts/permission'

jest.mock('@/store/modules')

const schedule = require('@/testUtils/dummyApiData/schedule/get.json')
const reservationList = require('@/testUtils/dummyApiData/reservation/list-for-schedule-split.json')

const assertClose = function (wrapper) {
  expect(wrapper.emitted()['update:show'][0][0]).toBe(false)
}
const assertNotClose = function (wrapper) {
  expect(wrapper.emitted()['update:show']).toBeFalsy()
}

describe('ListModalDetails', () => {
  let mountOption
  let apiService
  beforeEach(() => {
    promiseMocker.init()
    mountOption = mountOptionCreator.create(storeModules)
    mountOption.propsData = {
      show: false,
      schedule: null
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
      beforeEach(() => {
        wrapper = mount(ListModalDetails, mountOption)
      })

      describe('schedule：なし', () => {
        describe('表示', () => {
          beforeEach(async () => {
            apiService.getReservationListForSchedule = jest.fn()
            await wrapper.setProps({ show: true })
          })

          test('閉じる', () => {
            assertClose(wrapper)
          })

          test('予約データ取得処理は呼び出さない', () => {
            expect(apiService.getReservationListForSchedule).not.toHaveBeenCalled()
          })
        })
      })

      describe('schedule：あり', () => {
        beforeEach(async () => {
          await wrapper.setProps({ schedule })
        })

        describe('表示', () => {
          let loadError
          let loadSwitch
          beforeEach(async () => {
            loadError = new Error('load')
            loadSwitch = promiseMocker.createSwitch()
            apiService.getReservationListForSchedule = promiseMocker.mock(reservationList, loadError, loadSwitch)
            await wrapper.setProps({ show: true })
          })

          test('閉じない', () => {
            assertNotClose(wrapper)
          })

          test('アラートクリア', () => {
            expect(storeModules.alert.mutations.clear).toHaveBeenCalled()
          })

          test('Processingカバー表示開始', () => {
            expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
          })

          test('予約データ取得処理を呼出', () => {
            expect(apiService.getReservationListForSchedule).toHaveBeenCalledWith(schedule.id)
          })

          test('Processingカバー表示中', () => {
            expect(storeModules.processing.mutations.endGet).not.toHaveBeenCalled()
          })

          describe('データ取得：エラー', () => {
            beforeEach(() => {
              promiseMocker.setSwitch(loadSwitch, false)
              apiService.isHandledError = jest.fn().mockReturnValueOnce(true)
              promiseMocker.flushPendings()
            })

            test('閉じる', () => {
              assertClose(wrapper)
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

            test('閉じない', () => {
              assertNotClose(wrapper)
            })

            test('モーダル全体表示', () => {
              expect(wrapper.element).toMatchSnapshot()
            })

            test('Processingカバー表示終了', () => {
              expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
            })
          })
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
      beforeEach(() => {
        wrapper = mount(ListModalDetails, mountOption)
      })

      describe('表示', () => {
        beforeEach(async () => {
          await wrapper.setProps({ schedule })
          apiService.getReservationListForSchedule = promiseMocker.mockResolved(reservationList)
          await wrapper.setProps({ show: true })
          promiseMocker.flushPendings()
        })

        test('予約一覧アクション表示', () => {
          expect(wrapper.find('td.my-action').element).toMatchSnapshot()
        })

        test('フッター表示', () => {
          expect(wrapper.find('footer.modal-footer').element).toMatchSnapshot()
        })
      })
    })
  })
})
