export default {
  namespaced: true,
  state: () => ({
    show: 'responsive'
  }),
  mutations: {
    toggleDesktop (state) {
      const isOpen = [true, 'responsive'].includes(state.show)
      state.show = isOpen ? false : 'responsive'
    },
    toggleMobile (state) {
      const isClosed = [false, 'responsive'].includes(state.show)
      state.show = isClosed ? true : 'responsive'
    },
    set (state, value) {
      state.show = value
    }
  }
}
