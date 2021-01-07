import Error from '../Error'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import storeModules from '@/store/modules'

jest.mock('@/store/modules')

describe('Error', () => {
  let mountOption
  beforeEach(() => {
    mountOption = mountOptionCreator.create(storeModules)
  })

  describe.each(['403', '404'])('%s', (code) => {
    describe('マウント', () => {
      let wrapper
      beforeEach(async () => {
        wrapper = await pageTester.mount(Error, {
          name: 'error',
          params: { code }
        }, mountOption)
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
})
