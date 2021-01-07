import sidebar from '../sidebar'
import mountOptionCreator from '@/testUtils/mountOptionCreator'

describe('store.modules.sidebar', () => {
  let store
  beforeEach(() => {
    const modules = { sidebar }
    const mountOption = mountOptionCreator.create(modules)
    store = mountOption.store
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('初期値', () => {
    test('レスポンシブ', () => {
      expect(store.state.sidebar.show).toBe('responsive')
    })
  })

  describe('mutations', () => {
    const labelToValue = {
      表示: true,
      非表示: false,
      レスポンシブ: 'responsive'
    }
    describe.each([
      [
        'toggleDesktop',
        [
          ['表示', '非表示'],
          ['レスポンシブ', '非表示'],
          ['非表示', 'レスポンシブ']
        ]
      ],
      [
        'toggleMobile',
        [
          ['表示', 'レスポンシブ'],
          ['レスポンシブ', '表示'],
          ['非表示', '表示']
        ]
      ]
    ])('%s', (mutation, testCase) => {
      describe.each(testCase)('case: %s', (caseLabel, expectedLabel) => {
        beforeEach(() => {
          store.state.sidebar.show = labelToValue[caseLabel]
          store.commit(`sidebar/${mutation}`)
        })

        test(expectedLabel, () => {
          expect(store.state.sidebar.show).toBe(labelToValue[expectedLabel])
        })
      })
    })

    describe('set', () => {
      beforeEach(() => {
        store.state.sidebar.show = true
        store.commit('sidebar/set', 'responsive')
      })

      test('レスポンシブ', () => {
        expect(store.state.sidebar.show).toBe('responsive')
      })
    })
  })
})
