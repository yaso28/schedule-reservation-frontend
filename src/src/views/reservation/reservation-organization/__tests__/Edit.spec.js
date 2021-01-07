import Edit from '../Edit'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'
import myFormMocker from '@/testUtils/myFormMocker'

jest.mock('@/store/modules')
jest.mock('@/models/MyForm')

const record = require('@/testUtils/dummyApiData/reservation-organization/get.json')
const id = record.id
const makeFormArgs = {
  name: record.name,
  abbreviation: record.abbreviation,
  registration_number: record.registration_number
}
const saveResult = require('@/testUtils/dummyApiData/common/update.json')
saveResult.id = id

function getFormWrapper (wrapper) {
  return wrapper.find('form')
}

describe('Edit', () => {
  let mountOption
  let apiService
  let router
  beforeEach(() => {
    promiseMocker.init()
    mountOption = mountOptionCreator.create(storeModules)
    apiService = mountOption.provide.apiService
    router = mountOption.router
  })

  afterEach(() => {
    promiseMocker.clear()
    jest.resetAllMocks()
  })

  describe('マウント', () => {
    let wrapper
    let loadSwtich
    let loadError
    beforeEach(async () => {
      loadSwtich = promiseMocker.createSwitch()
      loadError = new Error('error')
      apiService.getReservationOrganization = promiseMocker.mock(
        record,
        loadError,
        loadSwtich
      )
      wrapper = await pageTester.mount(Edit, { name: 'reservation.reservation-organization.edit', params: { id } }, mountOption)
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
      expect(apiService.getReservationOrganization).toHaveBeenCalledWith(id)
    })

    test('Processingカバー表示中', () => {
      expect(
        storeModules.processing.mutations.endGet
      ).not.toHaveBeenCalled()
    })

    describe('データ取得：エラー', () => {
      beforeEach(() => {
        promiseMocker.setSwitch(loadSwtich, false)
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
        promiseMocker.setSwitch(loadSwtich, true)
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
          apiService.getReservationOrganization = promiseMocker.mock(
            record,
            loadError,
            loadSwtich
          )
          storeModules.processing.mutations.beginGet.mockReset()
          storeModules.processing.mutations.endGet.mockReset()
          wrapper.setProps({ id: newId })
        })

        test('Processingカバー表示開始', () => {
          expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
        })

        test('データ取得処理を呼出', () => {
          expect(apiService.getReservationOrganization).toHaveBeenCalledWith(newId)
        })

        test('Processingカバー表示中', () => {
          expect(
            storeModules.processing.mutations.endGet
          ).not.toHaveBeenCalled()
        })
      })

      describe('リセットボタンクリック', () => {
        beforeEach(() => {
          wrapper.find('#btn-reset').trigger('click')
        })

        test('フォームリセット', () => {
          expect(form.reset).toHaveBeenCalledWith()
        })
      })

      describe('フォーム送信', () => {
        let saveSwitch
        let saveError
        beforeEach(() => {
          saveSwitch = promiseMocker.createSwitch()
          saveError = new Error('save')
          apiService.updateReservationOrganization = promiseMocker.mock(
            saveResult,
            saveError,
            saveSwitch
          )
          getFormWrapper(wrapper).trigger('submit')
        })

        test('Processingカバー表示開始', () => {
          expect(storeModules.processing.mutations.beginPost).toHaveBeenCalled()
        })

        test('アラートクリア', () => {
          expect(storeModules.alert.mutations.clear).toHaveBeenCalled()
        })

        test('保存処理を呼出', () => {
          expect(apiService.updateReservationOrganization).toHaveBeenCalledWith(id, form)
        })

        test('Processingカバー表示中', () => {
          expect(
            storeModules.processing.mutations.endPost
          ).not.toHaveBeenCalled()
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
        })

        describe('保存：成功', () => {
          beforeEach(() => {
            promiseMocker.setSwitch(saveSwitch, true)
            router.push = jest.fn()
            promiseMocker.flushPendings()
          })

          test('アラート', () => {
            expect(storeModules.alert.actions.saveSuccess).toHaveBeenCalled()
          })

          test('リダイレクト', () => {
            expect(router.push).toHaveBeenCalledWith({ name: 'reservation.reservation-organization.list' })
          })

          test('Processingカバー表示終了', () => {
            expect(storeModules.processing.mutations.endPost).toHaveBeenCalled()
          })
        })
      })
    })
  })
})
