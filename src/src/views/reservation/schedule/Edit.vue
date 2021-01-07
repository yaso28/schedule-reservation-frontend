<template>
  <div>
    <slot name="h1" />

    <CForm
      v-if="loaded"
      @submit.prevent="save"
    >
      <CCard>
        <CCardBody>
          <MyDate
            :label="$t('schedule.ymd')"
            :form="form"
            field="ymd"
            :show-clear="false"
          />
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
            :label="$t('schedule_status.model')"
            :form="form"
            field="schedule_status_id"
            :options="scheduleStatusList"
          />

          <hr class="my-4">

          <p class="h5">
            {{ $t('reservation.model') }}
          </p>
          <CCard
            v-for="(reservation, index) in form.values.reservation_list"
            :key="reservation.id"
            class="my-2"
          >
            <CCardBody>
              <MyTime
                :label="$t('schedule.begins_at')"
                :form="form"
                :field="`reservation_list.${index}.begins_at`"
              />
              <MyTime
                :label="$t('schedule.ends_at')"
                :form="form"
                :field="`reservation_list.${index}.ends_at`"
              />
              <MySelect
                :label="$t('reservation_status.model')"
                :form="form"
                :field="`reservation_list.${index}.reservation_status_id`"
                :options="reservationStatusList"
              />
              <CLink
                class="btn btn-outline-primary"
                :to="{ name: 'reservation.reservation.split', params: { id: reservation.id } }"
              >
                {{ $t('action.split') }}
              </CLink>
            </CCardBody>
          </CCard>
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
  name: 'ReservationScheduleEdit',
  components: {
    MyDate: require('@/components/inputs/MyDate').default,
    MyTime: require('@/components/inputs/MyTime').default,
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
      placeList: null,
      usageList: null,
      timetableList: null,
      scheduleStatusList: null,
      reservationStatusList: null
    }
  },
  computed: {
    loaded () {
      return !!(this.form && this.placeList && this.usageList && this.timetableList && this.scheduleStatusList && this.reservationStatusList)
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
        let scheduleRecord
        let reservationRecordList
        [this.placeList, this.usageList, this.timetableList, this.scheduleStatusList, this.reservationStatusList, scheduleRecord, reservationRecordList] = await Promise.all([
          this.placeList ?? this.apiService.getSchedulePlaceList(),
          this.usageList ?? this.apiService.getScheduleUsageList(),
          this.timetableList ?? this.apiService.getScheduleTimetableList(),
          this.scheduleStatusList ?? this.apiService.getScheduleStatusList(),
          this.reservationStatusList ?? this.apiService.getReservationStatusList(),
          this.apiService.getSchedule(this.id),
          this.apiService.getReservationListForSchedule(this.id)
        ])
        this.form = this.apiService.makeForm({
          ymd: scheduleRecord.ymd,
          begins_at: scheduleRecord.begins_at,
          ends_at: scheduleRecord.ends_at,
          schedule_place_id: scheduleRecord.schedule_place_id,
          schedule_usage_id: scheduleRecord.schedule_usage_id,
          schedule_timetable_id: scheduleRecord.schedule_timetable_id,
          schedule_status_id: scheduleRecord.schedule_status_id,
          reservation_list: reservationRecordList.map(record => ({
            id: record.id,
            begins_at: record.begins_at,
            ends_at: record.ends_at,
            reservation_status_id: record.reservation_status_id
          }))
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
        await this.apiService.updateSchedule(this.id, this.form)
        this.$store.dispatch('alert/saveSuccessNoRedirect')
        this.form.setInit()
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
