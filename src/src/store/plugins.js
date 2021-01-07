import createPersistedState from 'vuex-persistedstate'

export default [
  createPersistedState({
    key: 'info',
    paths: ['auth']
  })
]
