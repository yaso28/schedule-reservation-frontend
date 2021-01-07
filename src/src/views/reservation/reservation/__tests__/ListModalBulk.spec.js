import ListModalBulk from '../ListModalBulk'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'
import myFormMocker from '@/testUtils/myFormMocker'
import { mount } from '@vue/test-utils'

jest.mock('@/store/modules')
jest.mock('@/models/MyForm')

const reservationStatusList = require('@/testUtils/dummyApiData/reservation-status/list.json')
const reservationList = require('@/testUtils/dummyApiData/reservation/list.json')

const getBtnSaveWrapper = wrapper => wrapper.find('button.btn-save')

const assertClose = function (wrapper) {
  expect(wrapper.emitted()['update:show'][0][0]).toBe(false)
}
const assertNotClose = function (wrapper) {
  expect(wrapper.emitted()['update:show']).toBeFalsy()
}
const getSaveEventLog = wrapper => wrapper.emitted().save

describe('ListModalBulk', () => {
  let mountOption
  let apiService
  beforeEach(() => {
    promiseMocker.init()
    mountOption = mountOptionCreator.create(storeModules)
    mountOption.propsData = {
      show: false,
      items: null,
      reservationStatusList
    }
    apiService = mountOption.provide.apiService
  })

  afterEach(() => {
    promiseMocker.clear()
    jest.resetAllMocks()
  })

  describe('マウント', () => {
    let wrapper
    beforeEach(async () => {
      wrapper = mount(ListModalBulk, mountOption)
    })

    describe('items：なし', () => {
      describe('表示', () => {
        beforeEach(async () => {
          apiService.makeForm = jest.fn()
          await wrapper.setProps({ show: true })
        })

        test('閉じる', () => {
          assertClose(wrapper)
        })

        test('フォームは作成しない', () => {
          expect(apiService.makeForm).not.toHaveBeenCalled()
        })
      })
    })

    describe('items：あり', () => {
      let items
      beforeEach(async () => {
        items = reservationList.slice(1, 4)
        await wrapper.setProps({ items })
      })

      describe('表示', () => {
        let form
        let makeFormArgs
        beforeEach(async () => {
          makeFormArgs = {
            id_list: items.map(item => item.id),
            reservation_status_id: null
          }
          form = myFormMocker.createMock(makeFormArgs)
          apiService.makeForm = jest.fn().mockReturnValueOnce(form)
          await wrapper.setProps({ show: true })
        })

        test('閉じない', () => {
          assertNotClose(wrapper)
        })

        test('フォーム作成', () => {
          expect(apiService.makeForm).toHaveBeenCalledWith(makeFormArgs)
        })

        test('モーダル全体表示', () => {
          expect(wrapper.element).toMatchSnapshot()
        })

        describe('保存ボタンクリック', () => {
          let saveError
          let saveSwitch
          beforeEach(async () => {
            saveError = new Error('save')
            saveSwitch = promiseMocker.createSwitch()
            apiService.bulkChangeReservation = promiseMocker.mock(null, saveError, saveSwitch)
            await getBtnSaveWrapper(wrapper).trigger('click')
          })

          test('アラートクリア', () => {
            expect(storeModules.alert.mutations.clear).toHaveBeenCalled()
          })

          test('Processingカバー表示開始', () => {
            expect(storeModules.processing.mutations.beginPost).toHaveBeenCalled()
          })

          test('保存処理を呼出', () => {
            expect(apiService.bulkChangeReservation).toHaveBeenCalledWith(form)
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

            test('成功アラートは表示しない', () => {
              expect(storeModules.alert.actions.saveSuccessNoRedirect).not.toHaveBeenCalled()
            })

            test('閉じない', () => {
              assertNotClose(wrapper)
            })

            test('保存成功イベントは投げない', () => {
              expect(getSaveEventLog(wrapper)).toBeFalsy()
            })

            test('Processingカバー表示終了', () => {
              expect(storeModules.processing.mutations.endPost).toHaveBeenCalled()
            })
          })

          describe('保存：成功', () => {
            beforeEach(() => {
              promiseMocker.flushPendings()
            })

            test('成功アラート表示', () => {
              expect(storeModules.alert.actions.saveSuccessNoRedirect).toHaveBeenCalled()
            })

            test('閉じる', () => {
              assertClose(wrapper)
            })

            test('保存成功イベント投げる', () => {
              expect(getSaveEventLog(wrapper)).toBeTruthy()
            })

            test('Processingカバー表示終了', () => {
              expect(storeModules.processing.mutations.endPost).toHaveBeenCalled()
            })
          })
        })
      })
    })
  })
})
