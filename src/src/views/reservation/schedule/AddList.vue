<template>
  <div>
    <slot name="h1" />

    <CForm
      v-if="loaded"
      @submit.prevent="save"
    >
      <CCard>
        <CCardBody>
          <MyArray
            :label="$t('schedule.ymd')"
            :form="form"
            field="ymd_list"
          >
            <template #default="{innerForm, innerField}">
              <MyDateNoWrapper
                :field="innerField"
                :form="innerForm"
                :show-clear="false"
              />
            </template>
            <template #listItem="{item}">
              <MyDateSpan :value="item" />
            </template>
          </MyArray>
          <MyTime
            :label="$t('schedule.begins_at')"
            :form="form"
            field="begins_at"
          />
          <MyTime
            :label="$t('schedule.ends_at')"
            :form="form"
            field="ends_at"
          />
          <MySelect
            :label="$t('schedule_place.model')"
            :form="form"
            field="schedule_place_id"
            :options="placeList"
          />
          <MySelect
            :label="$t('schedule_usage.model')"
            :form="form"
            field="schedule_usage_id"
            :options="usageList"
          />
          <MySelect
            :label="$t('schedule_timetable.model')"
            :form="form"
            field="schedule_timetable_id"
            :options="timetableList"
          />
          <MySelect
            :label="$t('reservation_status.model')"
            :form="form"
            field="reservation_status_id"
            :options="reservationStatusList"
          />
          <MySelect
            :label="$t('schedule_status.model')"
            :form="form"
            field="schedule_status_id"
            :options="scheduleStatusList"
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
  name: 'ReservationScheduleAddList',
  components: {
    MyArray: require('@/components/inputs/MyArray').default,
    MyDateNoWrapper: require('@/components/inputs/MyDateNoWrapper').default,
    MyDateSpan: require('@/components/MyDateSpan').default,
    MyTime: require('@/components/inputs/MyTime').default,
    MySelect: require('@/components/inputs/MySelect').default
  },
  inheritAttrs: false,
  inject: ['apiService'],
  data () {
    return {
      form: null,
      placeList: null,
      usageList: null,
      timetableList: null,
      reservationStatusList: null,
      scheduleStatusList: null
    }
  },
  computed: {
    loaded () {
      return !!(this.form && this.placeList && this.usageList && this.timetableList && this.reservationStatusList && this.scheduleStatusList)
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    async load () {
      try {
        this.$store.commit('processing/beginGet')
        ;[this.placeList, this.usageList, this.timetableList, this.reservationStatusList, this.scheduleStatusList] = await Promise.all([
          this.apiService.getSchedulePlaceList(),
          this.apiService.getScheduleUsageList(),
          this.apiService.getScheduleTimetableList(),
          this.apiService.getReservationStatusList(),
          this.apiService.getScheduleStatusList()
        ])
        this.form = this.apiService.makeForm({
          ymd_list: [],
          begins_at: '',
          ends_at: '',
          schedule_place_id: null,
          schedule_usage_id: null,
          schedule_timetable_id: null,
          reservation_status_id: null,
          schedule_status_id: null
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
        await this.apiService.addScheduleList(this.form)
        this.$store.dispatch('alert/saveSuccessNoRedirect')
        this.form.reset()
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
