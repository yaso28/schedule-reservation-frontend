import Home from '../Home'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import storeModules from '@/store/modules'

jest.mock('@/store/modules')

describe('Home', () => {
  let mountOption
  beforeEach(() => {
    mountOption = mountOptionCreator.create(storeModules)
  })

  describe('マウント', () => {
    let wrapper
    beforeEach(async () => {
      wrapper = await pageTester.mount(Home, { name: 'home' }, mountOption)
    })

    test('title', () => {
      pageTester.assertTitleTag()
    })

    test('meta tags', () => {
      pageTester.assertMetaTags()
    })

    test('ページ全体表示', () => {
      expect(wrapper.element).toMatchSnapshot()
    })
  })
})
