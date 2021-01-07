<template>
  <CModal
    :show="visible"
    :title="$t('common.details')"
    color="info"
    centered
    @update:show="updateShow"
  >
    <dl
      v-if="schedule"
      class="row"
    >
      <dt class="col-sm-4">
        {{ $t('schedule.ymd') }}
      </dt>
      <dd class="col-sm-8">
        <MyDateSpan :value="schedule.ymd" />
      </dd>
      <dt class="col-sm-4">
        {{ $t('schedule.begins_at') }}
      </dt>
      <dd class="col-sm-8">
        {{ schedule.begins_at }}
      </dd>
      <dt class="col-sm-4">
        {{ $t('schedule.ends_at') }}
      </dt>
      <dd class="col-sm-8">
        {{ schedule.ends_at }}
      </dd>
      <dt class="col-sm-4">
        {{ $t('schedule_place.model') }}
      </dt>
      <dd class="col-sm-8">
        {{ schedule.schedule_place.name }}
      </dd>
      <dt class="col-sm-4">
        {{ $t('schedule_usage.model') }}
      </dt>
      <dd class="col-sm-8">
        {{ schedule.schedule_usage.name }}
      </dd>
      <dt class="col-sm-4">
        {{ $t('schedule_timetable.model') }}
      </dt>
      <dd
        class="col-sm-8 nl2br"
        v-text="timetable"
      />
      <dt class="col-sm-4">
        {{ $t('reservation_status.model') }}
      </dt>
      <dd class="col-sm-8">
        {{ schedule.reservation_status.name }}
      </dd>
      <dt class="col-sm-4">
        {{ $t('schedule_status.model') }}
      </dt>
      <dd class="col-sm-8">
        {{ schedule.schedule_status.name }}
      </dd>
    </dl>

    <p class="h5">
      {{ $t('reservation.model') }}
    </p>
    <CDataTable
      v-if="reservationList"
      :items="reservationList"
      :fields="fields"
      :header="false"
      add-table-classes="mb-0"
    >
      <template #reservation_status="{item}">
        <td>
          {{ item.reservation_status.name }}
        </td>
      </template>
      <template #action="{item}">
        <td class="my-action">
          <CLink
            v-if="canWrite"
            class="btn btn-outline-primary"
            :to="{ name: 'reservation.reservation.split', params: { id: item.id } }"
          >
            {{ $t('action.split') }}
          </CLink>
        </td>
      </template>
    </CDataTable>

    <template #footer>
      <template v-if="canWrite && schedule">
        <CLink
          class="btn btn-outline-primary"
          :to="{ name: 'reservation.schedule.edit', params: { id: schedule.id } }"
        >
          {{ $t('action.edit') }}
        </CLink>
      </template>
      <template v-else>
          &nbsp;
      </template>
    </template>
  </CModal>
</template>

<script>
import permission from '@/consts/permission'

export default {
  name: 'ListModalDetails',
  components: {
    MyDateSpan: require('@/components/MyDateSpan').default
  },
  inheritAttrs: false,
  inject: ['apiService'],
  props: {
    show: {
      type: Boolean,
      default: false
    },
    schedule: {
      type: Object,
      default: () => null
    }
  },
  data () {
    return {
      visible: this.show,
      reservationList: null
    }
  },
  computed: {
    fields () {
      return [
        { key: 'begins_at', label: this.$t('schedule.begins_at') },
        { key: 'ends_at', label: this.$t('schedule.ends_at') },
        { key: 'reservation_status', label: this.$t('reservation_status.model') },
        { key: 'action', label: '' }
      ]
    },
    timetable () {
      return this.schedule.schedule_timetable?.details ?? ' '
    },
    canWrite () {
      return this.$store.getters['auth/can'][permission.reservation.write]
    }
  },
  watch: {
    show (to) {
      if (to) {
        this.onShow()
      } else {
        this.onHide()
      }
    }
  },
  mounted () {
    if (this.show) {
      this.onShow()
    }
  },
  methods: {
    updateShow (value) {
      this.$emit('update:show', value)
    },
    async onShow () {
      if (!this.schedule) {
        this.updateShow(false)
        return
      }
      try {
        this.$store.commit('alert/clear')
        this.$store.commit('processing/beginGet')
        this.reservationList = await this.apiService.getReservationListForSchedule(this.schedule.id)
        this.visible = true
      } catch (e) {
        this.updateShow(false)
        if (!this.apiService.isHandledError(e)) {
          throw e
        }
      } finally {
        this.$store.commit('processing/endGet')
      }
    },
    onHide () {
      this.visible = false
    }
  }
}
</script>
