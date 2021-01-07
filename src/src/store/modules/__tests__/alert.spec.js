import alert from '../alert'
import mountOptionCreator from '@/testUtils/mountOptionCreator'

const expectedScrollToArgs = {
  top: 0,
  left: 0,
  behavior: 'smooth'
}
const valuesOld = [
  {
    key: 'key-1',
    type: 'info',
    message: 'message.sample.1dsgsf'
  },
  {
    key: 'key-2',
    type: 'success',
    message: 'message.sample.2lfghgsg',
    redirect: true
  },
  {
    key: 'key-3',
    type: 'danger',
    message: 'message.sample.3hlsgsd',
    redirect: false
  },
  {
    key: 'key-4',
    type: 'warning',
    message: 'message.sample.4l4hlihl'
  },
  {
    key: 'key-5',
    type: 'success',
    message: 'message.sample.5lbgsfhsd',
    redirect: true
  },
  {
    key: 'key-6',
    type: 'danger',
    message: 'message.sample.6hskdhsdgg'
  }
]
const valuesExpectedAfterRedirect = [
  {
    key: 'key-2',
    type: 'success',
    message: 'message.sample.2lfghgsg',
    redirect: false
  },
  {
    key: 'key-5',
    type: 'success',
    message: 'message.sample.5lbgsfhsd',
    redirect: false
  }
]

describe('store.modules.alert', () => {
  let store
  beforeEach(() => {
    const modules = { alert }
    const mountOption = mountOptionCreator.create(modules)
    store = mountOption.store
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('初期値', () => {
    test('アラートなし', () => {
      expect(store.state.alert.values).toEqual([])
    })
  })

  describe('mutations', () => {
    beforeEach(() => {
      store.state.alert.values = valuesOld.concat()
    })

    describe('add', () => {
      let value
      beforeEach(() => {
        value = {
          type: 'info',
          message: 'message.sample'
        }
        window.scrollTo = jest.fn()
        store.commit('alert/add', value)
      })

      test('keyをセット', () => {
        expect(value.key).toBeTruthy()
      })

      test('アラート追加', () => {
        expect(store.state.alert.values).toEqual(valuesOld.concat([value]))
      })

      test('スクロール', () => {
        expect(window.scrollTo).toHaveBeenCalledWith(expectedScrollToArgs)
      })
    })

    describe('clear', () => {
      beforeEach(() => {
        store.commit('alert/clear')
      })

      test('アラートなし', () => {
        expect(store.state.alert.values).toEqual([])
      })
    })

    describe('onRouteChange', () => {
      beforeEach(() => {
        store.commit('alert/onRouteChange')
      })

      test('リダイレクト通過対象のみ残す', () => {
        expect(store.state.alert.values).toEqual(valuesExpectedAfterRedirect)
      })
    })
  })

  describe('actions', () => {
    beforeEach(() => {
      store.state.alert.values = valuesOld.concat()
    })

    describe.each([
      [
        'apiError',
        {
          type: 'danger',
          message: 'message.error.api'
        }
      ],
      [
        'validationError',
        {
          type: 'danger',
          message: 'message.error.validation'
        }
      ],
      [
        'saveSuccessNoRedirect',
        {
          type: 'success',
          message: 'message.save.success'
        }
      ],
      [
        'saveSuccess',
        {
          type: 'success',
          message: 'message.save.success',
          redirect: true
        }
      ],
      [
        'sendSuccess',
        {
          type: 'success',
          message: 'message.send.success',
          redirect: true
        }
      ],
      [
        'selectRequired',
        {
          type: 'warning',
          message: 'message.select_required'
        }
      ]
    ])('%s', (action, expectedAddedValue) => {
      let actualAddedValue
      beforeEach(() => {
        window.scrollTo = jest.fn()
        store.dispatch(`alert/${action}`)
        actualAddedValue = store.state.alert.values.slice(-1)[0]
        expectedAddedValue.key = actualAddedValue.key
      })

      test('keyをセット', () => {
        expect(actualAddedValue.key).toBeTruthy()
      })

      test('該当アラート追加', () => {
        expect(store.state.alert.values).toEqual(
          valuesOld.concat([expectedAddedValue])
        )
      })

      test('スクロール', () => {
        expect(window.scrollTo).toHaveBeenCalledWith(expectedScrollToArgs)
      })
    })
  })
})
