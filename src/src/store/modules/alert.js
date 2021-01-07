import { makeRandomString } from '@/helpers/random'

export default {
  namespaced: true,
  state: () => ({
    values: []
  }),
  mutations: {
    add (state, value) {
      value.key = makeRandomString()
      state.values.push(value)
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    },
    clear (state) {
      state.values = []
    },
    onRouteChange (state) {
      const newValues = []
      state.values.forEach(value => {
        if (value.redirect) {
          value.redirect = false
          newValues.push(value)
        }
      })
      state.values = newValues
    }
  },
  actions: {
    apiError (context) {
      context.commit('add', {
        type: 'danger',
        message: 'message.error.api'
      })
    },
    validationError (context) {
      context.commit('add', {
        type: 'danger',
        message: 'message.error.validation'
      })
    },
    saveSuccessNoRedirect (context) {
      context.commit('add', {
        type: 'success',
        message: 'message.save.success'
      })
    },
    saveSuccess (context) {
      context.commit('add', {
        type: 'success',
        message: 'message.save.success',
        redirect: true
      })
    },
    sendSuccess (context) {
      context.commit('add', {
        type: 'success',
        message: 'message.send.success',
        redirect: true
      })
    },
    selectRequired (context) {
      context.commit('add', {
        type: 'warning',
        message: 'message.select_required'
      })
    }
  }
}
