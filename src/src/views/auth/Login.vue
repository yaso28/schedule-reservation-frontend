<template>
  <div>
    <slot name="h1" />

    <CForm @submit.prevent="login">
      <CCard>
        <CCardBody>
          <MyText
            :label="$t('user.id')"
            :form="form"
            field="email"
          />
          <MyText
            :label="$t('user.password')"
            :form="form"
            field="password"
            type="password"
          />
        </CCardBody>
        <CCardFooter>
          <CButton
            type="submit"
            color="primary"
          >
            {{ $t("action.login") }}
          </CButton>
        </CCardFooter>
      </CCard>
    </CForm>
  </div>
</template>

<script>
export default {
  name: 'AuthLogin',
  components: {
    MyText: require('@/components/inputs/MyText').default
  },
  inject: ['apiService'],
  inheritAttrs: false,
  data () {
    return {
      form: this.apiService.makeForm({
        email: '',
        password: ''
      })
    }
  },
  methods: {
    async login () {
      try {
        this.$store.commit('processing/beginPost')
        this.$store.commit('alert/clear')
        const result = await this.apiService.login(this.form)
        this.$store.dispatch('auth/set', result)
        this.$router.push({ name: 'home' })
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
