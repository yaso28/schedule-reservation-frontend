<template>
  <div>
    <slot name="h1" />

    <CCard v-if="loaded">
      <CCardHeader>
        <div class="header-buttons">
          <CButton
            class="btn-filter-show"
            color="info"
            variant="outline"
            @click="toggleFilter"
          >
            {{ $t('action.filter') }}
          </CButton>
          <CButton
            v-if="canWrite"
            class="btn-bulk-show-header"
            color="primary"
            variant="outline"
            @click="showBulkClicked"
          >
            {{ $t('action.bulk_change') }}
          </CButton>
          <CLink
            v-if="canWrite"
            class="btn btn-outline-primary"
            :to="{ name: 'reservation.schedule.add-list'}"
          >
            {{ $t('action.add') }}
          </CLink>
        </div>

        <CCollapse
          :show="showFilter"
          class="form-filter mt-2"
        >
          <MyDate
            :label="$t('schedule.ymd') + $t('common.range_from')"
            :form="formYmd"
            field="ymdFrom"
          />
          <MyDate
            :label="$t('schedule.ymd') + $t('common.range_to')"
            :form="formYmd"
            field="ymdTo"
          />
          <CButton
            class="btn-search"
            type="button"
            color="info"
            @click="load"
          >
            {{ $t('action.search') }}
          </CButton>

          <hr>

          <MyCheckboxes
            :label="$t('schedule_place.model')"
            :form="formFilter"
            field="placeIdList"
            :options="placeList"
            inline
          />
          <MyCheckboxes
            :label="$t('schedule_usage.model')"
            :form="formFilter"
            field="usageIdList"
            :options="usageList"
            inline
          />
          <MyCheckboxes
            :label="$t('reservation_status.model')"
            :form="formFilter"
            field="reservationStatusIdList"
            :options="reservationStatusList"
            inline
          />
          <MyCheckboxes
            :label="$t('schedule_status.model')"
            :form="formFilter"
            field="scheduleStatusIdList"
            :options="scheduleStatusList"
            inline
          />
          <CButton
            class="btn-filter-reset"
            color="secondary"
            @click="formFilter.reset()"
          >
            {{ $t("action.clear") }}
          </CButton>
          <CButton
            class="btn-filter-hide"
            color="info"
            variant="outline"
            @click="toggleFilter"
          >
            {{ $t("action.hide") }}
          </CButton>
        </CCollapse>
      </CCardHeader>

      <CCardBody>
        <CDataTable
          :items="itemsFiltered"
          :fields="fields"
          add-table-classes="text-nowrap"
        >
          <template #bulk-header>
            <input
              class="chk-all"
              type="checkbox"
              @change="checkAllChanged"
            >
          </template>
          <template #bulk="{item}">
            <td>
              <input
                v-model="item.bulk_selected"
                :class="`chk-${item.id}`"
                type="checkbox"
              >
            </td>
          </template>
          <template #ymd="{item}">
            <td>
              <MyDateSpan :value="item.ymd" />
            </td>
          </template>
          <template #time="{item}">
            <td>
              {{ item.begins_at }} - {{ item.ends_at }}
            </td>
          </template>
          <template #schedule_place="{item}">
            <td>
              {{ item.schedule_place.name }}
            </td>
          </template>
          <template #schedule_usage="{item}">
            <td>
              {{ item.schedule_usage.name }}
            </td>
          </template>
          <template #reservation_status="{item}">
            <td>
              {{ item.reservation_status.name }}
            </td>
          </template>
          <template #schedule_status="{item}">
            <td>
              {{ item.schedule_status.name }}
            </td>
          </template>
          <template #action="{item}">
            <td class="my-action">
              <CButton
                :class="`btn-details-${item.id}`"
                color="info"
                variant="outline"
                @click="showDetailsClicked(item)"
              >
                {{ $t('common.details') }}
              </CButton>
            </td>
          </template>
        </CDataTable>
      </CCardBody>

      <CCardFooter>
        <div class="footer-buttons">
          <CButton
            v-if="canWrite"
            class="btn-bulk-show-footer"
            color="primary"
            variant="outline"
            @click="showBulkClicked"
          >
            {{ $t('action.bulk_change') }}
          </CButton>
          <CLink
            v-if="canWrite"
            class="btn btn-outline-primary"
            :to="{ name: 'reservation.schedule.add-list'}"
          >
            {{ $t('action.add') }}
          </CLink>
        </div>
      </CCardFooter>
    </CCard>

    <ListModalBulk
      :show.sync="showBulk"
      :items="itemsSelected"
      :schedule-status-list="scheduleStatusList"
      @save="load"
    />
    <ListModalDetails
      :show.sync="showDetails"
      :schedule="detailsSchedule"
    />
  </div>
</template>

<script>
import permission from '@/consts/permission'

export default {
  name: 'ReservationScheduleList',
  components: {
    MyDate: require('@/components/inputs/MyDate').default,
    MyCheckboxes: require('@/components/inputs/MyCheckboxes').default,
    MyDateSpan: require('@/components/MyDateSpan').default,
    ListModalBulk: require('./ListModalBulk').default,
    ListModalDetails: require('./ListModalDetails').default
  },
  inheritAttrs: false,
  inject: ['apiService'],
  data () {
    return {
      items: null,
      formYmd: null,
      formFilter: null,
      placeList: null,
      usageList: null,
      reservationStatusList: null,
      scheduleStatusList: null,
      showFilter: false,
      showBulk: false,
      showDetails: false,
      detailsSchedule: null
    }
  },
  computed: {
    fields () {
      return [
        { key: 'bulk', label: '' },
        { key: 'ymd', label: this.$t('schedule.ymd') },
        { key: 'time', label: this.$t('schedule.time') },
        { key: 'schedule_place', label: this.$t('schedule_place.model') },
        { key: 'schedule_usage', label: this.$t('schedule_usage.model') },
        { key: 'reservation_status', label: this.$t('reservation_status.model') },
        { key: 'schedule_status', label: this.$t('schedule_status.model') },
        { key: 'action', label: '' }
      ]
    },
    loaded () {
      return this.items && this.formYmd && this.formFilter
    },
    itemsFiltered () {
      const emptyOrIncludes = (idList, id) => !idList.length || idList.includes(id)
      return (this.items ?? [])
        .filter(item => emptyOrIncludes(this.formFilter.values.placeIdList, item.schedule_place_id))
        .filter(item => emptyOrIncludes(this.formFilter.values.usageIdList, item.schedule_usage_id))
        .filter(item => emptyOrIncludes(this.formFilter.values.reservationStatusIdList, item.reservation_status_id))
        .filter(item => emptyOrIncludes(this.formFilter.values.scheduleStatusIdList, item.schedule_status_id))
    },
    itemsSelected () {
      return this.itemsFiltered.filter(item => item.bulk_selected)
    },
    canWrite () {
      return this.$store.getters['auth/can'][permission.reservation.write]
    }
  },
  watch: {
    $route (to, from) {
      if (to.query.from !== from.query.from || to.query.to !== from.query.to) {
        this.init()
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.formYmd = this.apiService.makeForm({
        ymdFrom: this.$route.query.from ?? '',
        ymdTo: this.$route.query.to ?? ''
      })
      this.formFilter = this.apiService.makeForm({
        placeIdList: [],
        usageIdList: [],
        reservationStatusIdList: [],
        scheduleStatusIdList: []
      })
      this.load()
    },
    async load () {
      try {
        this.$store.commit('processing/beginGet')
        ;[this.items, this.placeList, this.usageList, this.reservationStatusList, this.scheduleStatusList] = await Promise.all([
          this.apiService.getScheduleList(this.formYmd.values.ymdFrom, this.formYmd.values.ymdTo),
          this.placeList ?? this.apiService.getSchedulePlaceList(),
          this.usageList ?? this.apiService.getScheduleUsageList(),
          this.reservationStatusList ?? this.apiService.getReservationStatusList(),
          this.scheduleStatusList ?? this.apiService.getScheduleStatusList()
        ])
        this.selectAll(false)
      } catch (e) {
        if (!this.apiService.isHandledError(e)) {
          throw e
        }
      } finally {
        this.$store.commit('processing/endGet')
      }
    },
    toggleFilter () {
      this.showFilter = !this.showFilter
    },
    selectAll (value) {
      this.items.forEach(item => this.$set(item, 'bulk_selected', value))
    },
    checkAllChanged (event) {
      this.selectAll(event.target.checked)
    },
    showBulkClicked () {
      this.$store.commit('alert/clear')
      if (!this.itemsSelected.length) {
        this.$store.dispatch('alert/selectRequired')
        return
      }
      this.showBulk = true
    },
    async showDetailsClicked (schedule) {
      this.detailsSchedule = schedule
      this.showDetails = true
    }
  }
}
</script>
