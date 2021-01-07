import { mount } from '@vue/test-utils'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import MyContainer from '../MyContainer'
import storeModules from '@/store/modules'

jest.mock('@/store/modules')

describe('MyContainer', () => {
  let store
  let mountOption
  let wrapper
  beforeEach(() => {
    mountOption = mountOptionCreator.create(storeModules)
    mountOption.stubs = ['MySidebar', 'MyHeader', 'MyPage']
    store = mountOption.store
    store.state.processing.get = false
    store.state.processing.post = false
    store.state.alert.values = []
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('通常', () => {
    beforeEach(() => {
      wrapper = mount(MyContainer, mountOption)
    })

    test('表示', () => {
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  describe('processing-cover', () => {
    describe('Get処理中', () => {
      beforeEach(async () => {
        store.state.processing.get = true
        wrapper = mount(MyContainer, mountOption)
      })

      test('Getカバー表示', () => {
        expect(wrapper.find('#processing-get').attributes()).toMatchSnapshot()
      })
    })

    describe('Post処理中', () => {
      beforeEach(async () => {
        store.state.processing.post = true
        wrapper = mount(MyContainer, mountOption)
      })

      test('Postカバー表示', () => {
        expect(wrapper.find('#processing-post').attributes()).toMatchSnapshot()
      })
    })
  })

  describe('アラート', () => {
    beforeEach(async () => {
      store.state.alert.values = [
        { key: 1, type: 'success', message: 'message.save.success' },
        { key: 2, type: 'danger', message: 'message.error.api' },
        { key: 3, type: 'danger', message: 'message.error.validation' }
      ]
      wrapper = mount(MyContainer, mountOption)
    })

    test('アラート表示', () => {
      expect(wrapper.find('#alert-area').element).toMatchSnapshot()
    })
  })
})
