import auth from '../auth'
import mountOptionCreator from '@/testUtils/mountOptionCreator'

const userOld = {
  id: 1,
  name: 'やそやそ',
  email: 'user1@sample.org'
}
const userNew = {
  id: 2,
  name: 'タカチャン',
  email: 'user2@example.com'
}
const permissionsOld = [{ id: 1, name: 'permission.1' }, { id: 2, name: 'permission.2' }]
const canOldExpected = {
  'permission.1': true,
  'permission.2': true
}
const permissionsNew = [{ id: 2, name: 'permission.2' }, { id: 4, name: 'permission.4' }]

describe('store.modules.auth', () => {
  let store
  beforeEach(() => {
    const modules = { auth }
    const mountOption = mountOptionCreator.create(modules)
    store = mountOption.store
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('初期値', () => {
    test('ユーザー情報なし', () => {
      expect(store.state.auth.user).toBeNull()
    })

    test('権限情報なし', () => {
      expect(store.state.auth.permissions).toEqual([])
    })
  })

  describe('getters', () => {
    describe('isLogin', () => {
      describe('ユーザー情報なし', () => {
        beforeEach(() => {
          store.state.auth.user = null
        })

        test('falseを返す', () => {
          expect(store.getters['auth/isLogin']).toBe(false)
        })
      })

      describe('ユーザー情報あり', () => {
        beforeEach(() => {
          store.state.auth.user = userOld
        })

        test('trueを返す', () => {
          expect(store.getters['auth/isLogin']).toBe(true)
        })
      })
    })
  })

  describe('can', () => {
    describe('権限情報なし', () => {
      beforeEach(() => {
        store.state.auth.permissions = []
      })

      test('空のオブジェクトを返す', () => {
        expect(store.getters['auth/can']).toEqual({})
      })
    })

    describe('権限情報あり', () => {
      beforeEach(() => {
        store.state.auth.permissions = permissionsOld
      })

      test("{ 'permission.name': true, ...} を返す", () => {
        expect(store.getters['auth/can']).toEqual(canOldExpected)
      })
    })
  })

  describe('mutations', () => {
    describe('setUser', () => {
      beforeEach(() => {
        store.state.auth.user = userOld
        store.commit('auth/setUser', userNew)
      })

      test('ユーザー情報をセット', () => {
        expect(store.state.auth.user).toEqual(userNew)
      })
    })

    describe('setPermissions', () => {
      beforeEach(() => {
        store.state.auth.permissions = permissionsOld
        store.commit('auth/setPermissions', permissionsNew)
      })

      test('権限情報をセット', () => {
        expect(store.state.auth.permissions).toEqual(permissionsNew)
      })
    })
  })

  describe('actions', () => {
    describe('set', () => {
      beforeEach(() => {
        store.dispatch('auth/set', {
          user: userNew,
          permissions: permissionsNew
        })
      })

      test('ユーザー情報をセット', () => {
        expect(store.state.auth.user).toEqual(userNew)
      })

      test('権限情報をセット', () => {
        expect(store.state.auth.permissions).toEqual(permissionsNew)
      })
    })

    describe('clear', () => {
      beforeEach(() => {
        store.state.auth.user = userOld
        store.state.auth.permissions = permissionsOld
        store.dispatch('auth/clear')
      })

      test('ユーザー情報なし', () => {
        expect(store.state.auth.user).toBeNull()
      })

      test('権限情報なし', () => {
        expect(store.state.auth.permissions).toEqual([])
      })
    })
  })
})
