import HttpInterceptor from '../HttpInterceptor'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import storeModules from '@/store/modules'
jest.mock('@/store/modules')

function mockError (httpStatusCode = null, hasCustomMessage = false) {
  const error = new Error()
  if (httpStatusCode) {
    error.response = {
      status: httpStatusCode
    }
    if (hasCustomMessage) {
      error.response.data = {
        custom_message: 'カスタムエラーです'
      }
    }
  }
  return error
}

describe('HttpInterceptor', () => {
  let httpInterceptor
  let router
  let apiService
  beforeEach(() => {
    const mountOption = mountOptionCreator.create(storeModules)
    router = mountOption.router
    apiService = mountOption.provide.apiService
    const store = mountOption.store
    httpInterceptor = new HttpInterceptor(apiService, router, store)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('onResponseError()', () => {
    beforeEach(() => {
      router.push = jest.fn()
      apiService.setErrorHandled = jest.fn()
    })

    describe('error 401', () => {
      let error
      let result
      beforeEach(async () => {
        error = mockError(401)
        try {
          await httpInterceptor.onResponseError(error)
        } catch (e) {
          result = e
        }
      })

      test('ストアから認証情報をクリア', () => {
        expect(storeModules.auth.actions.clear).toHaveBeenCalled()
      })

      test('リダイレクト：ログイン', () => {
        expect(router.push).toHaveBeenCalledWith({ name: 'login' })
      })

      test('apiService処理済マーク', () => {
        expect(apiService.setErrorHandled).toHaveBeenCalledWith(error)
      })

      test('エラー投げる', () => {
        expect(result).toBe(error)
      })
    })

    describe('error 419', () => {
      let error
      let result
      beforeEach(async () => {
        error = mockError(419)
        try {
          await httpInterceptor.onResponseError(error)
        } catch (e) {
          result = e
        }
      })

      test('ストアから認証情報をクリア', () => {
        expect(storeModules.auth.actions.clear).toHaveBeenCalled()
      })

      test('リダイレクト：ログイン', () => {
        expect(router.push).toHaveBeenCalledWith({ name: 'login' })
      })

      test('apiService処理済マーク', () => {
        expect(apiService.setErrorHandled).toHaveBeenCalledWith(error)
      })

      test('エラー投げる', () => {
        expect(result).toBe(error)
      })
    })

    describe('error 403', () => {
      let error
      let result
      beforeEach(async () => {
        error = mockError(403)
        try {
          await httpInterceptor.onResponseError(error)
        } catch (e) {
          result = e
        }
      })

      test('リダイレクト：エラー403', () => {
        expect(router.push).toHaveBeenCalledWith({
          name: 'error',
          params: { code: '403' }
        })
      })

      test('apiService処理済マーク', () => {
        expect(apiService.setErrorHandled).toHaveBeenCalledWith(error)
      })

      test('エラー投げる', () => {
        expect(result).toBe(error)
      })
    })

    describe('error 404', () => {
      let error
      let result
      beforeEach(async () => {
        error = mockError(404)
        try {
          await httpInterceptor.onResponseError(error)
        } catch (e) {
          result = e
        }
      })

      test('リダイレクト：エラー404', () => {
        expect(router.push).toHaveBeenCalledWith({
          name: 'error',
          params: { code: '404' }
        })
      })

      test('apiService処理済マーク', () => {
        expect(apiService.setErrorHandled).toHaveBeenCalledWith(error)
      })

      test('エラー投げる', () => {
        expect(result).toBe(error)
      })
    })

    describe('error 422', () => {
      describe('カスタムメッセージなし', () => {
        let error
        let result
        beforeEach(async () => {
          error = mockError(422)
          try {
            await httpInterceptor.onResponseError(error)
          } catch (e) {
            result = e
          }
        })

        test('アラート表示：バリデーションエラー', () => {
          expect(storeModules.alert.actions.validationError).toHaveBeenCalled()
        })

        test('apiService処理済マーク', () => {
          expect(apiService.setErrorHandled).toHaveBeenCalledWith(error)
        })

        test('エラー投げる', () => {
          expect(result).toBe(error)
        })
      })

      describe('カスタムメッセージあり', () => {
        let error
        let result
        beforeEach(async () => {
          error = mockError(422, true)
          try {
            await httpInterceptor.onResponseError(error)
          } catch (e) {
            result = e
          }
        })

        test('アラート表示：カスタムメッセージ', () => {
          expect(storeModules.alert.mutations.add.mock.calls[0][1]).toEqual({
            type: 'danger',
            message: error.response.data.custom_message
          })
        })

        test('apiService処理済マーク', () => {
          expect(apiService.setErrorHandled).toHaveBeenCalledWith(error)
        })

        test('エラー投げる', () => {
          expect(result).toBe(error)
        })
      })
    })

    describe('error other http exceptions', () => {
      describe('カスタムメッセージなし', () => {
        let error
        let result
        beforeEach(async () => {
          error = mockError(500)
          try {
            await httpInterceptor.onResponseError(error)
          } catch (e) {
            result = e
          }
        })

        test('アラート表示：APIエラー', () => {
          expect(storeModules.alert.actions.apiError).toHaveBeenCalled()
        })

        test('apiService処理済マーク', () => {
          expect(apiService.setErrorHandled).toHaveBeenCalledWith(error)
        })

        test('エラー投げる', () => {
          expect(result).toBe(error)
        })
      })

      describe('カスタムメッセージあり', () => {
        let error
        let result
        beforeEach(async () => {
          error = mockError(500, true)
          try {
            await httpInterceptor.onResponseError(error)
          } catch (e) {
            result = e
          }
        })

        test('アラート表示：カスタムメッセージ', () => {
          expect(storeModules.alert.mutations.add.mock.calls[0][1]).toEqual({
            type: 'danger',
            message: error.response.data.custom_message
          })
        })

        test('apiService処理済マーク', () => {
          expect(apiService.setErrorHandled).toHaveBeenCalledWith(error)
        })

        test('エラー投げる', () => {
          expect(result).toBe(error)
        })
      })
    })

    describe('error no response', () => {
      let error
      let result
      beforeEach(async () => {
        error = mockError()
        try {
          await httpInterceptor.onResponseError(error)
        } catch (e) {
          result = e
        }
      })

      test('アラート表示：APIエラー', () => {
        expect(storeModules.alert.actions.apiError).toHaveBeenCalled()
      })

      test('apiService処理済マーク', () => {
        expect(apiService.setErrorHandled).toHaveBeenCalledWith(error)
      })

      test('エラー投げる', () => {
        expect(result).toBe(error)
      })
    })
  })
})
