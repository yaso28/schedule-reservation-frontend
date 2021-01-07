import processing from '../processing'
import mountOptionCreator from '@/testUtils/mountOptionCreator'

describe('store.modules.processing', () => {
  let store
  beforeEach(() => {
    const modules = { processing }
    const mountOption = mountOptionCreator.create(modules)
    store = mountOption.store
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('初期値', () => {
    test('GETなし', () => {
      expect(store.state.processing.get).toBe(false)
    })

    test('POSTなし', () => {
      expect(store.state.processing.post).toBe(false)
    })
  })

  describe('mutations', () => {
    describe('beginGet', () => {
      beforeEach(() => {
        store.state.processing.get = false
        store.commit('processing/beginGet')
      })

      test('GET処理中', () => {
        expect(store.state.processing.get).toBe(true)
      })
    })

    describe('endGet', () => {
      beforeEach(() => {
        store.state.processing.get = true
        store.commit('processing/endGet')
      })

      test('GETなし', () => {
        expect(store.state.processing.get).toBe(false)
      })
    })

    describe('beginPost', () => {
      beforeEach(() => {
        store.state.processing.post = false
        store.commit('processing/beginPost')
      })

      test('POST処理中', () => {
        expect(store.state.processing.post).toBe(true)
      })
    })

    describe('endPost', () => {
      beforeEach(() => {
        store.state.processing.post = true
        store.commit('processing/endPost')
      })

      test('POSTなし', () => {
        expect(store.state.processing.post).toBe(false)
      })
    })
  })
})
