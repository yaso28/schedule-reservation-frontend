export default class NavigationGuard {
  #router
  #store

  constructor (router, store) {
    this.#router = router
    this.#store = store
  }

  beforeEach (to, from, next) {
    // check no-login required
    if (to.matched.some(r => r.meta?.guest)) {
      if (this.#store.getters['auth/isLogin']) {
        next({ name: 'home' })
        return
      }
    }

    // check login required
    if (to.matched.some(r => r.meta?.auth)) {
      if (!this.#store.getters['auth/isLogin']) {
        next({ name: 'login' })
        return
      }
    }

    // check permission required
    const permissionRequiredRouteNodes = to.matched.filter(routeNode => routeNode.meta?.can)
    for (let i = 0; i < permissionRequiredRouteNodes.length; i++) {
      const routeNode = permissionRequiredRouteNodes[i]
      if (!this.#store.getters['auth/can'][routeNode.meta.can]) {
        next({
          name: 'error',
          params: { code: '403' }
        })
        return
      }
    }

    next()
  }

  afterEach () {
    // alert across redirect
    this.#store.commit('alert/onRouteChange')
  }

  set () {
    this.#router.beforeEach((to, from, next) =>
      this.beforeEach(to, from, next)
    )
    this.#router.afterEach(() => this.afterEach())
  }
}
