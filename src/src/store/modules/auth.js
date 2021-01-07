export default {
  namespaced: true,
  state: () => ({
    user: null,
    permissions: []
  }),
  getters: {
    isLogin: state => {
      return !!state.user
    },
    can: state => {
      const result = {}
      state.permissions.forEach(permission => {
        result[permission.name] = true
      })
      return result
    }
  },
  mutations: {
    setUser (state, user) {
      state.user = user
    },
    setPermissions (state, permissions) {
      state.permissions = permissions
    }
  },
  actions: {
    set (context, authInfo) {
      context.commit('setUser', authInfo.user)
      context.commit('setPermissions', authInfo.permissions)
    },
    clear (context) {
      context.commit('setUser', null)
      context.commit('setPermissions', [])
    }
  }
}
