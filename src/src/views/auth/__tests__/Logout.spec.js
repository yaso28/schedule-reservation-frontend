import Logout from '../Logout'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'

jest.mock('@/store/modules')

describe('Logout', () => {
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
    let wrapper
    let logoutSwitch
    let logoutError
    beforeEach(async () => {
      logoutSwitch = promiseMocker.createSwitch()
      logoutError = new Error()
      apiService.logout = promiseMocker.mock(
        null,
        logoutError,
        logoutSwitch
      )
      wrapper = await pageTester.mount(Logout, { name: 'logout' }, mountOption)
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

    test('Processingカバー表示開始', () => {
      expect(storeModules.processing.mutations.beginPost).toHaveBeenCalled()
    })

    test('ログアウト処理を呼出', () => {
      expect(apiService.logout).toHaveBeenCalledWith()
    })

    test('Processingカバー表示中', () => {
      expect(storeModules.processing.mutations.endPost).not.toHaveBeenCalled()
    })

    describe('ログアウト：エラー', () => {
      beforeEach(() => {
        promiseMocker.setSwitch(logoutSwitch, false)
        apiService.isHandledError = jest.fn().mockReturnValueOnce(true)
        promiseMocker.flushPendings()
      })

      test('エラー処理', () => {
        expect(apiService.isHandledError).toHaveBeenCalledWith(logoutError)
      })

      test('Processingカバー表示終了', () => {
        expect(storeModules.processing.mutations.endPost).toHaveBeenCalled()
      })
    })

    describe('ログアウト：成功', () => {
      beforeEach(() => {
        promiseMocker.setSwitch(logoutSwitch, true)
        router.push = jest.fn()
        promiseMocker.flushPendings()
      })

      test('認証情報クリア', () => {
        expect(storeModules.auth.actions.clear).toHaveBeenCalled()
      })

      test('ログインページへ転送', () => {
        expect(router.push).toHaveBeenCalledWith({ name: 'login' })
      })

      test('Processingカバー表示終了', () => {
        expect(storeModules.processing.mutations.endPost).toHaveBeenCalled()
      })
    })
  })
})
