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
        </div>

        <CCollapse
          :show="showFilter"
          class="form-filter mt-2"
        >
          <MyDate
            :label="$t('schedule.ymd') + $t('common.range_from')"
            :form="formFilter"
            field="ymdFrom"
          />
          <MyDate
            :label="$t('schedule.ymd') + $t('common.range_to')"
            :form="formFilter"
            field="ymdTo"
          />
          <MyCheckboxes
            :label="$t('schedule_usage.model_public')"
            :form="formFilter"
            field="usageIdList"
            :options="usageListFiltered"
            inline
          />
          <MyCheckboxes
            :label="$t('schedule_place.model')"
            :form="formFilter"
            field="placeIdList"
            :options="placeListFiltered"
            inline
          />
          <MyCheckboxes
            :label="$t('schedule_status.model_public')"
            :form="formFilter"
            field="scheduleStatusIdList"
            :options="scheduleStatusListFiltered"
            inline
          >
            <template #label="{option}">
              <MyScheduleStatusBadge
                :status="option"
                default-color="info"
              />
            </template>
          </MyCheckboxes>
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
          pagination
          :items-per-page="itemsPerPage"
          :items-per-page-select="{ label: $t('common.items_per_page') }"
          add-table-classes="text-nowrap"
          @pagination-change="itemsPerPageChanged"
        >
          <template #ymd="{item}">
            <td :class="{ 'my-inherits-above': item.inheritsAbove }">
              <MyDateSpan
                v-show="!item.inheritsAbove"
                :value="item.ymd"
              />
            </td>
          </template>
          <template #time="{item}">
            <td>
              {{ item.begins_at }} - {{ item.ends_at }}
            </td>
          </template>
          <template #schedule_usage="{item}">
            <td>
              {{ item.schedule_usage.name }}
            </td>
          </template>
          <template #schedule_place="{item}">
            <td>
              {{ item.schedule_place.name }}
            </td>
          </template>
          <template #schedule_status="{item}">
            <td>
              <MyScheduleStatusBadge
                :status="item.schedule_status"
              />
            </td>
          </template>
          <template #action="{item}">
            <td class="my-action">
              <CButton
                :class="`btn-details-${item.id}`"
                color="info"
                variant="outline"
                size="sm"
                @click="showDetailsClicked(item)"
              >
                {{ $t('common.details') }}
              </CButton>
            </td>
          </template>
        </CDataTable>
      </CCardBody>

      <CCardFooter>
        <div
          v-if="notes"
          class="my-notes"
        >
          <p class="h5">
            {{ $t('common.notes') }}
          </p>
          <p class="nl2br">
            {{ notes }}
          </p>
        </div>
      </CCardFooter>
    </CCard>

    <CModal
      :show.sync="showDetails"
      :title="$t('common.details')"
      color="info"
      centered
    >
      <dl
        v-if="detailsSchedule"
        class="row"
      >
        <dt class="col-sm-4">
          {{ $t('schedule.ymd') }}
        </dt>
        <dd class="col-sm-8">
          <MyDateSpan :value="detailsSchedule.ymd" />
        </dd>
        <dt class="col-sm-4">
          {{ $t('schedule.begins_at') }}
        </dt>
        <dd class="col-sm-8">
          {{ detailsSchedule.begins_at }}
        </dd>
        <dt class="col-sm-4">
          {{ $t('schedule.ends_at') }}
        </dt>
        <dd class="col-sm-8">
          {{ detailsSchedule.ends_at }}
        </dd>
        <dt class="col-sm-4">
          {{ $t('schedule_usage.model_public') }}
        </dt>
        <dd class="col-sm-8">
          {{ detailsSchedule.schedule_usage.name }}
        </dd>
        <dt class="col-sm-4">
          {{ $t('schedule_place.model') }}
        </dt>
        <dd class="col-sm-8">
          {{ detailsSchedule.schedule_place.name }}
        </dd>
        <dt class="col-sm-4">
          {{ $t('schedule_timetable.model') }}
        </dt>
        <dd
          class="col-sm-8 nl2br"
          v-text="detailsTimetable"
        />
        <dt class="col-sm-4">
          {{ $t('schedule_status.model_public') }}
        </dt>
        <dd class="col-sm-8">
          <MyScheduleStatusBadge
            :status="detailsSchedule.schedule_status"
            default-color="info"
          />
        </dd>
      </dl>
    </CModal>
  </div>
</template>

<script>
import setting from '@/consts/setting'

export default {
  name: 'ScheduleList',
  components: {
    MyDate: require('@/components/inputs/MyDate').default,
    MyCheckboxes: require('@/components/inputs/MyCheckboxes').default,
    MyDateSpan: require('@/components/MyDateSpan').default,
    MyScheduleStatusBadge: require('@/components/MyScheduleStatusBadge').default
  },
  inheritAttrs: false,
  inject: ['apiService'],
  data () {
    return {
      items: null,
      showFilter: false,
      formFilter: this.apiService.makeForm({
        ymdFrom: '',
        ymdTo: '',
        placeIdList: [],
        usageIdList: [],
        scheduleStatusIdList: []
      }),
      usageList: null,
      placeList: null,
      scheduleStatusList: null,
      itemsPerPage: 10,
      showDetails: false,
      detailsSchedule: null,
      notes: null
    }
  },
  computed: {
    fields () {
      return [
        { key: 'ymd', label: this.$t('schedule.ymd') },
        { key: 'time', label: this.$t('schedule.time') },
        { key: 'schedule_usage', label: this.$t('schedule_usage.model_public') },
        { key: 'schedule_place', label: this.$t('schedule_place.model') },
        { key: 'schedule_status', label: '' },
        { key: 'action', label: '' }
      ]
    },
    loaded () {
      return this.items && this.usageList && this.placeList && this.scheduleStatusList
    },
    itemsFiltered () {
      const emptyOrIncludes = (idList, id) => !idList.length || idList.includes(id)
      const result = (this.items ?? [])
        .filter(item => !this.formFilter.values.ymdFrom || this.formFilter.values.ymdFrom <= item.ymd)
        .filter(item => !this.formFilter.values.ymdTo || item.ymd <= this.formFilter.values.ymdTo)
        .filter(item => emptyOrIncludes(this.formFilter.values.usageIdList, item.schedule_usage_id))
        .filter(item => emptyOrIncludes(this.formFilter.values.placeIdList, item.schedule_place_id))
        .filter(item => emptyOrIncludes(this.formFilter.values.scheduleStatusIdList, item.schedule_status_id))
      const me = this
      result.forEach((item, index) => {
        item.inheritsAbove = index % me.itemsPerPage !== 0 && item.ymd === result[index - 1].ymd
      })
      return result
    },
    usageListFiltered () {
      return this.usageList?.filter(item => item.is_public)
    },
    placeListFiltered () {
      return this.placeList?.filter(item => this.items?.map(schedule => schedule.schedule_place_id)?.includes(item.id))
    },
    scheduleStatusListFiltered () {
      return this.scheduleStatusList?.filter(item => item.is_public)
    },
    detailsTimetable () {
      return this.detailsSchedule?.schedule_timetable?.details ?? ' '
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    async load () {
      try {
        this.$store.commit('processing/beginGet')
        let notesRecord
        ;[this.items, this.usageList, this.placeList, this.scheduleStatusList, notesRecord] = await Promise.all([
          this.apiService.getScheduleListPublic(),
          this.apiService.getScheduleUsageList(),
          this.apiService.getSchedulePlaceList(),
          this.apiService.getScheduleStatusList(),
          this.apiService.getSetting(setting.reservation_public.category, setting.reservation_public.notes)
        ])
        this.notes = notesRecord.value
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
    itemsPerPageChanged (newValue) {
      this.itemsPerPage = newValue
    },
    showDetailsClicked (schedule) {
      this.detailsSchedule = schedule
      this.showDetails = true
    }
  }
}
</script>
