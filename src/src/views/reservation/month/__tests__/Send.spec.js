import Send from '../Send'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'
import myFormMocker from '@/testUtils/myFormMocker'
import { CModal } from '@coreui/vue'

jest.mock('@/store/modules')
jest.mock('@/models/MyForm')

const sendInfo = require('@/testUtils/dummyApiData/month/send-prepare.json')
const id = sendInfo.month.id
const makeFormArgs = {
  mail_to: sendInfo.mail_to,
  subject: sendInfo.subject,
  message: sendInfo.message
}
const sendResult = require('@/testUtils/dummyApiData/common/update.json')
sendResult.id = id

const getModalWrapper = wrapper => wrapper.findComponent(CModal)
const chooseModal = function (wrapper, isOk) {
  wrapper.findComponent(CModal).vm.$emit('update:show', false, null, isOk)
}

describe('Send', () => {
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
    let loadSwitch
    beforeEach(async () => {
      loadError = new Error('load')
      loadSwitch = promiseMocker.createSwitch()
      apiService.prepareMonthScheduleSendInfo = promiseMocker.mock(sendInfo, loadError, loadSwitch)
      wrapper = await pageTester.mount(Send, { name: 'reservation.month.send', params: { id } }, mountOption)
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

    test('データ取得処理を呼出', () => {
      expect(apiService.prepareMonthScheduleSendInfo).toHaveBeenCalledWith(id)
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
          apiService.prepareMonthScheduleSendInfo = promiseMocker.mockResolved(sendInfo)
          storeModules.processing.mutations.beginGet.mockReset()
          storeModules.processing.mutations.endGet.mockReset()
          wrapper.setProps({ id: newId })
        })

        test('Processingカバー表示開始', () => {
          expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
        })

        test('データ取得処理を呼出', () => {
          expect(apiService.prepareMonthScheduleSendInfo).toHaveBeenCalledWith(newId)
        })

        test('Processingカバー表示中', () => {
          expect(storeModules.processing.mutations.endGet).not.toHaveBeenCalled()
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
        let sendError
        let sendSwitch
        beforeEach(async () => {
          sendError = new Error('send')
          sendSwitch = promiseMocker.createSwitch()
          apiService.sendMonthSchedule = promiseMocker.mock(sendResult, sendError, sendSwitch)
          await wrapper.find('form').trigger('submit')
        })

        test('確認モーダル表示', () => {
          expect(getModalWrapper(wrapper).props().show).toBeTruthy()
        })

        describe('確認モーダル：キャンセル', () => {
          beforeEach(() => {
            chooseModal(wrapper, false)
          })

          test('Processingカバーは表示しない', () => {
            expect(storeModules.processing.mutations.beginPost).not.toHaveBeenCalled()
          })

          test('アラートはクリアしない', () => {
            expect(storeModules.alert.mutations.clear).not.toHaveBeenCalled()
          })

          test('送信処理は呼び出さない', () => {
            expect(apiService.sendMonthSchedule).not.toHaveBeenCalled()
          })
        })

        describe('確認モーダル：OK', () => {
          let router
          beforeEach(() => {
            router = mountOption.router
            router.push = jest.fn()
            chooseModal(wrapper, true)
          })

          test('Processingカバー表示開始', () => {
            expect(storeModules.processing.mutations.beginPost).toHaveBeenCalled()
          })

          test('アラートクリア', () => {
            expect(storeModules.alert.mutations.clear).toHaveBeenCalled()
          })

          test('送信処理を呼出', () => {
            expect(apiService.sendMonthSchedule).toHaveBeenCalledWith(id, form)
          })

          test('Processingカバー表示中', () => {
            expect(storeModules.processing.mutations.endPost).not.toHaveBeenCalled()
          })

          describe('送信：エラー', () => {
            beforeEach(() => {
              promiseMocker.setSwitch(sendSwitch, false)
              apiService.isHandledError = jest.fn().mockReturnValueOnce(true)
              promiseMocker.flushPendings()
            })

            test('エラー処理', () => {
              expect(apiService.isHandledError).toHaveBeenCalledWith(sendError)
            })

            test('Processingカバー表示終了', () => {
              expect(storeModules.processing.mutations.endPost).toHaveBeenCalled()
            })

            test('成功アラートは呼び出さない', () => {
              expect(storeModules.alert.actions.sendSuccess).not.toHaveBeenCalled()
            })

            test('リダイレクトしない', () => {
              expect(router.push).not.toHaveBeenCalled()
            })
          })

          describe('保存：成功', () => {
            beforeEach(() => {
              promiseMocker.flushPendings()
            })

            test('成功アラート', () => {
              expect(storeModules.alert.actions.sendSuccess).toHaveBeenCalled()
            })

            test('リダイレクト', () => {
              expect(router.push).toHaveBeenCalledWith({ name: 'reservation.month.list' })
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
