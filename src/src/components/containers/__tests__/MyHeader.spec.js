import { mount } from '@vue/test-utils'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import MyHeader from '../MyHeader'
import storeModules from '@/store/modules'

jest.mock('@/store/modules')

describe('MyHeader', () => {
  let mountOption
  let wrapper
  let store
  beforeEach(() => {
    mountOption = mountOptionCreator.create(storeModules)
    store = mountOption.store
    store.state.auth.user = null
    storeModules.auth.getters.isLogin.mockReturnValue(false)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('認証なし', () => {
    beforeEach(() => {
      wrapper = mount(MyHeader, mountOption)
    })

    test('表示', () => {
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  describe('認証あり', () => {
    beforeEach(() => {
      store.state.auth.user = {
        id: 2,
        name: 'やそやそ',
        email: 'yaso@sample.com'
      }
      storeModules.auth.getters.isLogin.mockReturnValue(true)
      wrapper = mount(MyHeader, mountOption)
    })

    test('ユーザーメニュードロップダウン表示', () => {
      expect(wrapper.find('#usermenu-dropdown').element).toMatchSnapshot()
    })
  })

  describe('トグルボタン（モバイル）クリック', () => {
    beforeEach(() => {
      wrapper.find('#toggle-sidebar-mobile').trigger('click')
    })

    test('サイドバートグル（モバイル）呼出', () => {
      expect(storeModules.sidebar.mutations.toggleMobile).toHaveBeenCalled()
    })
  })

  describe('トグルボタン（デスクトップ）クリック', () => {
    beforeEach(() => {
      wrapper.find('#toggle-sidebar-desktop').trigger('click')
    })

    test('サイドバートグル（デスクトップ）呼出', () => {
      expect(storeModules.sidebar.mutations.toggleDesktop).toHaveBeenCalled()
    })
  })
})
