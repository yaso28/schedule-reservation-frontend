import Login from '../Login'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'
import myFormMocker from '@/testUtils/myFormMocker'

jest.mock('@/store/modules')
jest.mock('@/models/MyForm')

function getFormWrapper (wrapper) {
  return wrapper.find('form')
}

describe('Login', () => {
  let mountOption
  let router
  let apiService
  beforeEach(() => {
    promiseMocker.init()
    mountOption = mountOptionCreator.create(storeModules)
    router = mountOption.router
    apiService = mountOption.provide.apiService
  })

  afterEach(() => {
    promiseMocker.clear()
    jest.resetAllMocks()
  })

  describe('マウント', () => {
    let form
    let wrapper
    beforeEach(async () => {
      form = myFormMocker.createMock({
        email: '',
        password: ''
      })
      apiService.makeForm = jest.fn().mockReturnValueOnce(form)
      wrapper = await pageTester.mount(Login, { name: 'login' }, mountOption)
    })

    test('titleタグ', () => {
      pageTester.assertTitleTag()
    })

    test('metaタグ', () => {
      pageTester.assertMetaTags()
    })

    test('ページ全体表示', () => {
      expect(wrapper.element).toMatchSnapshot()
    })

    describe('フォーム送信', () => {
      let loginSwitch
      let loginResult
      let loginError
      beforeEach(() => {
        loginSwitch = promiseMocker.createSwitch()
        loginResult = require('@/testUtils/dummyApiData/auth/login.json')
        loginError = new Error()
        apiService.login = promiseMocker.mock(
          loginResult,
          loginError,
          loginSwitch
        )
        getFormWrapper(wrapper).trigger('submit')
      })

      test('Processingカバー表示開始', () => {
        expect(storeModules.processing.mutations.beginPost).toHaveBeenCalled()
      })

      test('ログイン処理を呼出', () => {
        expect(apiService.login).toHaveBeenCalledWith(form)
      })

      test('Processingカバー表示中', () => {
        expect(
          storeModules.processing.mutations.endPost
        ).not.toHaveBeenCalled()
      })

      describe('ログイン：エラー', () => {
        beforeEach(() => {
          promiseMocker.setSwitch(loginSwitch, false)
          apiService.isHandledError = jest.fn().mockReturnValueOnce(true)
          promiseMocker.flushPendings()
        })

        test('エラー処理', () => {
          expect(apiService.isHandledError).toHaveBeenCalledWith(loginError)
        })

        test('Processingカバー表示終了', () => {
          expect(storeModules.processing.mutations.endPost).toHaveBeenCalled()
        })
      })

      describe('ログイン：成功', () => {
        beforeEach(() => {
          promiseMocker.setSwitch(loginSwitch, true)
          router.push = jest.fn()
          promiseMocker.flushPendings()
        })

        test('認証情報セット', () => {
          expect(storeModules.auth.actions.set.mock.calls[0][1]).toBe(
            loginResult
          )
        })

        test('ホームページへ転送', () => {
          expect(router.push).toHaveBeenCalledWith({ name: 'home' })
        })

        test('Processingカバー表示終了', () => {
          expect(storeModules.processing.mutations.endPost).toHaveBeenCalled()
        })
      })
    })
  })
})
