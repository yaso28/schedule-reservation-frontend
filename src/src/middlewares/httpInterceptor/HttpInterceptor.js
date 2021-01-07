export default class HttpInterceptor {
  #apiService
  #router
  #store

  constructor (apiService, router, store) {
    this.#apiService = apiService
    this.#router = router
    this.#store = store
  }

  onResponseSuccess (response) {
    console.log(response)
    return response
  }

  onResponseError (error) {
    if (error?.response) {
      // case: response exists
      if (error.response.data?.custom_message) {
        // case: custom message exists
        this.#store.commit('alert/add', {
          type: 'danger',
          message: error.response.data.custom_message
        })
      } else {
        // case: no custom messagfe
        switch (error.response.status) {
          case 401: // authentication failed
          case 419: // csrf-token mismatch
            this.#store.dispatch('auth/clear')
            this.#router.push({ name: 'login' })
            break

          case 403: // permission denied
            this.#router.push({
              name: 'error',
              params: { code: '403' }
            })
            break

          case 404: // not found
            this.#router.push({
              name: 'error',
              params: { code: '404' }
            })
            break

          case 422: // validation failed
            this.#store.dispatch('alert/validationError')
            break

          default:
            // other http exception
            this.#store.dispatch('alert/apiError')
            break
        }
      }
    } else {
      // case: no response
      this.#store.dispatch('alert/apiError')
    }

    this.#apiService.setErrorHandled(error)
    console.log(error?.response ?? error)
    return Promise.reject(error)
  }

  set () {
    this.#apiService.addResponseInterceptor(
      response => this.onResponseSuccess(response),
      error => this.onResponseError(error)
    )
  }
}
