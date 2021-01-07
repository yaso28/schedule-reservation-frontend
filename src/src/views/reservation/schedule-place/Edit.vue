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
          <MyNumber
            :label="$t('schedule_place.price_per_hour')"
            :form="form"
            field="price_per_hour"
            :min="0"
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
  name: 'SchedulePlaceEdit',
  components: {
    MyText: require('@/components/inputs/MyText').default,
    MyNumber: require('@/components/inputs/MyNumber').default
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
      form: null
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
        const record = await this.apiService.getSchedulePlace(this.id)
        this.form = this.apiService.makeForm({
          name: record.name,
          abbreviation: record.abbreviation,
          price_per_hour: record.price_per_hour
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
        await this.apiService.updateSchedulePlace(this.id, this.form)
        this.$store.dispatch('alert/saveSuccess')
        this.$router.push({ name: 'reservation.schedule-place.list' })
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
