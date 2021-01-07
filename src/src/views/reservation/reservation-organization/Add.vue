<template>
  <div>
    <slot name="h1" />

    <CForm
      v-if="form"
      @submit.prevent="save"
    >
      <CCard>
        <CCardBody>
          <MyText
            :label="$t('common.name')"
            :form="form"
            field="name"
          />
          <MyText
            :label="$t('common.abbreviation')"
            :form="form"
            field="abbreviation"
          />
          <MyText
            :label="$t('reservation_organization.registration_number')"
            :form="form"
            field="registration_number"
          />
        </CCardBody>
        <CCardFooter>
          <CButton
            id="btn-reset"
            color="secondary"
            @click="form.reset()"
          >
            {{ $t("action.reset") }}
          </CButton>
          <CButton
            type="submit"
            color="primary"
          >
            {{ $t('action.save') }}
          </CButton>
        </CCardFooter>
      </CCard>
    </CForm>
  </div>
</template>

<script>
export default {
  name: 'ReservationOrganizationAdd',
  components: {
    MyText: require('@/components/inputs/MyText').default
  },
  inheritAttrs: false,
  inject: ['apiService'],
  data () {
    return {
      form: null
    }
  },
  watch: {
    $route (to, from) {
      if (to.query.original_id + '' !== from.query.original_id + '') {
        this.load()
      }
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    async load () {
      try {
        this.$store.commit('processing/beginGet')
        const originalId = this.$route.query.original_id
        const record = originalId ? await this.apiService.getReservationOrganization(originalId) : null
        this.form = this.apiService.makeForm({
          name: record?.name ?? '',
          abbreviation: record?.abbreviation ?? '',
          registration_number: record?.registration_number ?? ''
        })
      } catch (error) {
        if (!this.apiService.isHandledError(error)) {
          throw error
        }
      } finally {
        this.$store.commit('processing/endGet')
      }
    },
    async save () {
      try {
        this.$store.commit('processing/beginPost')
        this.$store.commit('alert/clear')
        await this.apiService.addReservationOrganization(this.form)
        this.$store.dispatch('alert/saveSuccess')
        this.$router.push({ name: 'reservation.reservation-organization.list' })
      } catch (error) {
        if (!this.apiService.isHandledError(error)) {
          throw error
        }
      } finally {
        this.$store.commit('processing/endPost')
      }
    }
  }
}
</script>
