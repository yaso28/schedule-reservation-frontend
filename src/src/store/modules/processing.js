export default {
  namespaced: true,
  state: () => ({
    get: false,
    post: false
  }),
  mutations: {
    beginGet (state) {
      state.get = true
    },
    endGet (state) {
      state.get = false
    },
    beginPost (state) {
      state.post = true
    },
    endPost (state) {
      state.post = false
    }
  }
}
