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
          <MyTextarea
            :label="$t('schedule_timetable.details')"
            :form="form"
            field="details"
            :rows="10"
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
  name: 'ScheduleTimetableEdit',
  components: {
    MyText: require('@/components/inputs/MyText').default,
    MyTextarea: require('@/components/inputs/MyTextarea').default
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
        const record = await this.apiService.getScheduleTimetable(this.id)
        this.form = this.apiService.makeForm({
          name: record.name,
          details: record.details
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
        await this.apiService.updateScheduleTimetable(this.id, this.form)
        this.$store.dispatch('alert/saveSuccess')
        this.$router.push({ name: 'reservation.schedule-timetable.list' })
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
