import Split from '../Split'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'
import myFormMocker from '@/testUtils/myFormMocker'

jest.mock('@/store/modules')
jest.mock('@/models/MyForm')

const reservation = require('@/testUtils/dummyApiData/reservation/get.json')
const id = reservation.id
const makeFormArgs = {
  splits_at: ''
}
const saveResult = require('@/testUtils/dummyApiData/reservation/split.json')

describe('Split', () => {
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
      apiService.getReservation = promiseMocker.mock(reservation, loadError, loadSwitch)
      wrapper = await pageTester.mount(Split, { name: 'reservation.reservation.split', params: { id } }, mountOption)
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

    test('予約レコード取得処理を呼出', () => {
      expect(apiService.getReservation).toHaveBeenCalledWith(id)
    })

    test('Processingカバー表示中', () => {
      expect(storeModules.processing.mutations.endGet).not.toHaveBeenCalled()
    })

    describe('予約レコード取得：エラー', () => {
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
          apiService.getReservation = promiseMocker.mockResolved(reservation)
          storeModules.processing.mutations.beginGet.mockReset()
          storeModules.processing.mutations.endGet.mockReset()
          wrapper.setProps({ id: newId })
        })

        test('Processingカバー表示開始', () => {
          expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
        })

        test('予約レコード取得処理を呼出', () => {
          expect(apiService.getReservation).toHaveBeenCalledWith(newId)
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
        let router
        let saveError
        let saveSwitch
        beforeEach(() => {
          router = mountOption.router
          router.push = jest.fn()
          saveError = new Error('save')
          saveSwitch = promiseMocker.createSwitch()
          apiService.splitReservation = promiseMocker.mock(saveResult, saveError, saveSwitch)
          wrapper.find('form').trigger('submit')
        })

        test('Processingカバー表示開始', () => {
          expect(storeModules.processing.mutations.beginPost).toHaveBeenCalled()
        })

        test('アラートクリア', () => {
          expect(storeModules.alert.mutations.clear).toHaveBeenCalled()
        })

        test('保存処理を呼出', () => {
          expect(apiService.splitReservation).toHaveBeenCalledWith(id, form)
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
            expect(storeModules.alert.actions.saveSuccess).not.toHaveBeenCalled()
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
            expect(storeModules.alert.actions.saveSuccess).toHaveBeenCalled()
          })

          test('リダイレクト', () => {
            expect(router.push).toHaveBeenCalledWith({ name: 'reservation.schedule.edit', params: { id: reservation.schedule_id } })
          })

          test('Processingカバー表示終了', () => {
            expect(storeModules.processing.mutations.endPost).toHaveBeenCalled()
          })
        })
      })
    })
  })
})
