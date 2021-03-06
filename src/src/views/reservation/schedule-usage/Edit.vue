<template>
  <div>
    <slot name="h1" />

    <CForm
      v-if="loaded"
      @submit.prevent="save"
    >
      <CCard>
        <CCardBody>
          <MyText
            :label="$t('common.name')"
            :form="form"
            field="name"
          />
          <MySwitch
            :label="$t('schedule_usage.is_public')"
            :form="form"
            field="is_public"
          />
          <MySelect
            :label="$t('reservation_organization.model')"
            :form="form"
            field="reservation_organization_id"
            :options="reservationOrganizations"
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
  name: 'ScheduleUsageEdit',
  components: {
    MyText: require('@/components/inputs/MyText').default,
    MySwitch: require('@/components/inputs/MySwitch').default,
    MySelect: require('@/components/inputs/MySelect').default
  },
  inheritAttrs: false,
  inject: ['apiService'],
  props: {
    id: {
      type: [Number, String],
      required: true
    }
  },
  data () {
    return {
      form: null,
      reservationOrganizations: null
    }
  },
  computed: {
    loaded () {
      return !!(this.form && this.reservationOrganizations)
    }
  },
  watch: {
    id () {
      this.load()
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    async load () {
      try {
        this.$store.commit('processing/beginGet')
        let record
        [this.reservationOrganizations, record] = await Promise.all([
          this.reservationOrganizations ?? this.apiService.getReservationOrganizationList(),
          this.apiService.getScheduleUsage(this.id)
        ])
        this.form = this.apiService.makeForm({
          name: record.name,
          is_public: record.is_public,
          reservation_organization_id: record.reservation_organization_id
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
        await this.apiService.updateScheduleUsage(this.id, this.form)
        this.$store.dispatch('alert/saveSuccess')
        this.$router.push({ name: 'reservation.schedule-usage.list' })
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
