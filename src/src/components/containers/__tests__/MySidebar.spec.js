import { mount } from '@vue/test-utils'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import MySidebar from '../MySidebar'
import storeModules from '@/store/modules'
import permission from '@/consts/permission'

jest.mock('@/store/modules')

describe('MySidebar', () => {
  let store
  let mountOption
  let wrapper
  beforeEach(() => {
    mountOption = mountOptionCreator.create(storeModules)
    store = mountOption.store
    store.state.sidebar.show = 'responsive'
    storeModules.auth.getters.isLogin.mockReturnValue(false)
    storeModules.auth.getters.can.mockReturnValue({})
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('認証なし', () => {
    beforeEach(() => {
      wrapper = mount(MySidebar, mountOption)
    })

    test('表示', () => {
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  describe('認証あり・権限なし', () => {
    beforeEach(() => {
      storeModules.auth.getters.isLogin.mockReturnValue(true)
      wrapper = mount(MySidebar, mountOption)
    })

    test('表示', () => {
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  describe('認証あり・権限あり', () => {
    beforeEach(() => {
      storeModules.auth.getters.isLogin.mockReturnValue(true)
    })

    describe.each([
      ['reservation.read', { [permission.reservation.read]: true }],
      ['reservation.write', { [permission.reservation.read]: true, [permission.reservation.write]: true }]
    ])('%s', (testCaseName, mockCanValue) => {
      beforeEach(() => {
        storeModules.auth.getters.can.mockReturnValue(mockCanValue)
        wrapper = mount(MySidebar, mountOption)
      })

      test('表示', () => {
        expect(wrapper.element).toMatchSnapshot()
      })
    })
  })

  describe('モバイルモード：サイドバー表示', () => {
    let backdrop
    beforeEach(() => {
      store.state.sidebar.show = true
      wrapper = mount(MySidebar, mountOption)
      backdrop = document.querySelector('div.c-sidebar-backdrop')
    })

    test('バックドロップ表示', () => {
      expect(backdrop).toBeInstanceOf(HTMLElement)
    })

    describe('バックドロップクリック', () => {
      beforeEach(() => {
        backdrop.click()
      })

      test('サイドバー隠す', () => {
        expect(storeModules.sidebar.mutations.set).toHaveBeenCalledWith(
          store.state.sidebar,
          'responsive'
        )
      })
    })
  })
})
