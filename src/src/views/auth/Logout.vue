<template>
  <div />
</template>

<script>
export default {
  name: 'AuthLogout',
  inject: ['apiService'],
  inheritAttrs: false,
  mounted () {
    this.logout()
  },
  methods: {
    async logout () {
      try {
        this.$store.commit('processing/beginPost')
        await this.apiService.logout()
        this.$store.dispatch('auth/clear')
        this.$router.push({ name: 'login' })
      } catch (e) {
        if (!this.apiService.isHandledError(e)) {
          throw e
        }
      } finally {
        this.$store.commit('processing/endPost')
      }
    }
  }
}
</script>
