<template>
  <div>
    <slot name="h1" />

    <CForm
      v-if="loaded"
      @submit.prevent="save"
    >
      <CCard>
        <CCardBody>
          <dl class="row">
            <dt class="col-sm-3">
              {{ $t('schedule.ymd') }}
            </dt>
            <dd class="col-sm-9">
              <MyDateSpan :value="reservation.schedule.ymd" />
            </dd>
            <dt class="col-sm-3">
              {{ $t('schedule_place.model') }}
            </dt>
            <dd class="col-sm-9">
              {{ reservation.schedule.schedule_place.name }}
            </dd>
            <dt class="col-sm-3">
              {{ $t('schedule.begins_at') }}
            </dt>
            <dd class="col-sm-9">
              {{ reservation.begins_at }}
            </dd>
            <dt class="col-sm-3">
              {{ $t('schedule.ends_at') }}
            </dt>
            <dd class="col-sm-9">
              {{ reservation.ends_at }}
            </dd>
          </dl>

          <MyTime
            :label="$t('reservation.splits_at')"
            :form="form"
            field="splits_at"
          />
        </CCardBody>
        <CCardFooter>
          <CButton
            class="btn-reset"
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
  name: 'ReservationSplit',
  components: {
    MyDateSpan: require('@/components/MyDateSpan').default,
    MyTime: require('@/components/inputs/MyTime').default
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
      reservation: null
    }
  },
  computed: {
    loaded () {
      return !!(this.form && this.reservation)
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
        this.reservation = await this.apiService.getReservation(this.id)
        this.form = this.apiService.makeForm({
          splits_at: ''
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
        await this.apiService.splitReservation(this.id, this.form)
        this.$store.dispatch('alert/saveSuccess')
        this.$router.push({ name: 'reservation.schedule.edit', params: { id: this.reservation.schedule_id } })
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
