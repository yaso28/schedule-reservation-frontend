import NavigationGuard from '../NavigationGuard'
import routes from '@/router/routes'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import storeModules from '@/store/modules'
import permission from '@/consts/permission'

jest.mock('@/store/modules')

function getMatchedRecursive (name, currentChildren) {
  for (let i = 0; i < currentChildren.length; i++) {
    const node = currentChildren[i]
    if (node.name === name) {
      return [node]
    } else if (Array.isArray(node.children)) {
      const result = getMatchedRecursive(name, node.children)
      if (result) {
        result.unshift(node)
        return result
      }
    }
  }
  return null
}
function getMockRoute (name) {
  const matched = getMatchedRecursive(name, routes)
  if (!matched) {
    return undefined
  }
  const route = Object.assign({}, matched.slice(-1)[0])
  route.matched = matched
  return route
}

describe('NavigationGuard', () => {
  let router
  let navigationGuard
  let from
  let next
  beforeEach(() => {
    const mountOption = mountOptionCreator.create(storeModules)
    router = mountOption.router
    const store = mountOption.store
    navigationGuard = new NavigationGuard(router, store)
    from = jest.fn()
    next = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('beforeEach()', () => {
    const authRequired = 'auth-required-vhli2dfg6kgvs2dojds'
    const guestRequired = 'guest-required-vk3oi4hg2flk52dlfs'
    /**
     * ここで各ルート名に対し、認証・権限ガードの期待値をセットする。
     * null: ガードなし
     * authRequired: 認証が必要（権限は不要）
     * guestRequired: 未認証が必要
     * 配列: 認証および配列で指定した権限が必要
     */
    describe.each([
      ['home', null],
      ['error', null],
      ['login', guestRequired],
      ['logout', authRequired],
      ['schedule.list', null],
      ['reservation.month.list', [permission.reservation.read]],
      ['reservation.month.send', [permission.reservation.read, permission.reservation.write]],
      ['reservation.schedule.list', [permission.reservation.read]],
      ['reservation.schedule.add-list', [permission.reservation.read, permission.reservation.write]],
      ['reservation.schedule.edit', [permission.reservation.read, permission.reservation.write]],
      ['reservation.reservation.list', [permission.reservation.read]],
      ['reservation.reservation.split', [permission.reservation.read, permission.reservation.write]],
      ['reservation.schedule-status.list', [permission.reservation.read]],
      ['reservation.reservation-status.list', [permission.reservation.read]],
      ['reservation.reservation-organization.list', [permission.reservation.read]],
      ['reservation.reservation-organization.add', [permission.reservation.read, permission.reservation.write]],
      ['reservation.reservation-organization.edit', [permission.reservation.read, permission.reservation.write]],
      ['reservation.reservation-organization.reorder', [permission.reservation.read, permission.reservation.write]],
      ['reservation.schedule-place.list', [permission.reservation.read]],
      ['reservation.schedule-place.add', [permission.reservation.read, permission.reservation.write]],
      ['reservation.schedule-place.edit', [permission.reservation.read, permission.reservation.write]],
      ['reservation.schedule-place.reorder', [permission.reservation.read, permission.reservation.write]],
      ['reservation.schedule-usage.list', [permission.reservation.read]],
      ['reservation.schedule-usage.add', [permission.reservation.read, permission.reservation.write]],
      ['reservation.schedule-usage.edit', [permission.reservation.read, permission.reservation.write]],
      ['reservation.schedule-usage.reorder', [permission.reservation.read, permission.reservation.write]],
      ['reservation.schedule-timetable.list', [permission.reservation.read]],
      ['reservation.schedule-timetable.add', [permission.reservation.read, permission.reservation.write]],
      ['reservation.schedule-timetable.edit', [permission.reservation.read, permission.reservation.write]],
      ['reservation.schedule-timetable.reorder', [permission.reservation.read, permission.reservation.write]],
      ['reservation.setting.edit', [permission.reservation.read, permission.reservation.write]],
      ['__invalid__', null]
    ])('%s', (routeName, expectedGuard) => {
      const mockRoute = getMockRoute(routeName)

      describe('ゲスト', () => {
        beforeEach(() => {
          storeModules.auth.getters.isLogin.mockReturnValue(false)
          storeModules.auth.getters.can.mockReturnValue({})
          navigationGuard.beforeEach(mockRoute, from, next)
        })

        if (!expectedGuard || expectedGuard === guestRequired) {
          // ガードなし
          // 未認証が必要
          test('パス', () => {
            expect(next).toHaveBeenCalledWith()
          })
        } else {
          // 認証が必要（権限は不要）
          // 認証および権限が必要
          test('リダイレクト：ログイン', () => {
            expect(next).toHaveBeenCalledWith({ name: 'login' })
          })
        }
      })

      describe('認証あり・権限なし', () => {
        beforeEach(() => {
          storeModules.auth.getters.isLogin.mockReturnValue(true)
          storeModules.auth.getters.can.mockReturnValue({})
          navigationGuard.beforeEach(mockRoute, from, next)
        })

        if (!expectedGuard || expectedGuard === authRequired) {
          // ガードなし
          // 認証が必要（権限は不要）
          test('パス', () => {
            expect(next).toHaveBeenCalledWith()
          })
        } else if (expectedGuard === guestRequired) {
          // 未認証が必要
          test('リダイレクト：ホーム', () => {
            expect(next).toHaveBeenCalledWith({ name: 'home' })
          })
        } else {
          // 認証および権限が必要
          test('リダイレクト：エラー403', () => {
            expect(next).toHaveBeenCalledWith({
              name: 'error',
              params: { code: '403' }
            })
          })
        }
      })

      describe('認証あり・権限一部', () => {
        beforeEach(() => {
          storeModules.auth.getters.isLogin.mockReturnValue(true)
          const mockCan = {}
          if (Array.isArray(expectedGuard)) {
            expectedGuard.slice(0, -1).forEach(function (permission) {
              mockCan[permission] = true
            })
          }
          storeModules.auth.getters.can.mockReturnValue(mockCan)
          navigationGuard.beforeEach(mockRoute, from, next)
        })

        if (!expectedGuard || expectedGuard === authRequired) {
          // ガードなし
          // 認証が必要（権限は不要）
          test('パス', () => {
            expect(next).toHaveBeenCalledWith()
          })
        } else if (expectedGuard === guestRequired) {
          // 未認証が必要
          test('リダイレクト：ホーム', () => {
            expect(next).toHaveBeenCalledWith({ name: 'home' })
          })
        } else {
          // 認証および権限が必要
          test('リダイレクト：エラー403', () => {
            expect(next).toHaveBeenCalledWith({
              name: 'error',
              params: { code: '403' }
            })
          })
        }
      })

      describe('認証あり・権限全て', () => {
        beforeEach(() => {
          storeModules.auth.getters.isLogin.mockReturnValue(true)
          const mockCan = {}
          const permissions = Array.isArray(expectedGuard) ? expectedGuard : ['dummy-permission-vw73ogtq351']
          permissions.forEach(function (permission) {
            mockCan[permission] = true
          })
          storeModules.auth.getters.can.mockReturnValue(mockCan)
          navigationGuard.beforeEach(mockRoute, from, next)
        })

        if (expectedGuard === guestRequired) {
          // 未認証が必要
          test('リダイレクト：ホーム', () => {
            expect(next).toHaveBeenCalledWith({ name: 'home' })
          })
        } else {
          // ガードなし
          // 認証が必要（権限は不要）
          // 認証および権限が必要
          test('パス', () => {
            expect(next).toHaveBeenCalledWith()
          })
        }
      })
    })
  })

  describe('afterEach()', () => {
    beforeEach(() => {
      navigationGuard.afterEach()
    })
    test('alert.onRouteChange()を呼出', () => {
      expect(storeModules.alert.mutations.onRouteChange).toHaveBeenCalled()
    })
  })
})
