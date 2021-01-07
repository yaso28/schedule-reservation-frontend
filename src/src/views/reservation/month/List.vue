<template>
  <div>
    <slot name="h1" />

    <CCard v-if="loaded">
      <CCardHeader>
        <CForm @submit.prevent="search">
          <CRow
            form
            class="form-group mb-0"
          >
            <CCol
              sm="6"
              class="form-inline"
            >
              <select
                id="search-year"
                v-model="searchYear"
                class="form-control"
              >
                <option
                  v-for="year in yearList"
                  :key="year"
                  :value="year"
                  :label="year"
                />
              </select>
              <label
                for="search-year"
                class="m-2"
              >
                {{ $t('month.year') }}
              </label>
              <select
                id="search-month"
                v-model="searchMonth"
                class="form-control"
              >
                <option
                  v-for="month in monthList"
                  :key="month"
                  :value="month"
                  :label="month"
                />
              </select>
              <label
                for="search-month"
                class="m-2"
              >
                {{ $t('month.month') }}{{ $t('month.later') }}
              </label>
            </CCol>
            <CCol sm="6">
              <CButton
                type="submit"
                color="info"
              >
                {{ $t('action.search') }}
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardHeader>

      <CCardBody>
        <CDataTable
          :items="itemsFiltered"
          :fields="fields"
        >
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
            <td>
              <CLink
                class="btn btn-outline-primary"
                :to="{ name: 'reservation.schedule.list', query: { from: item.first_day, to: item.last_day } }"
              >
                {{ $t('schedule.model') }}
              </CLink>
              <CLink
                class="btn btn-outline-primary"
                :to="{ name: 'reservation.reservation.list', query: { from: item.first_day, to: item.last_day } }"
              >
                {{ $t('reservation.model') }}
              </CLink>
              <CLink
                v-if="canWrite"
                class="btn btn-outline-primary"
                :to="{ name: 'reservation.month.send', params: { id: item.id } }"
              >
                {{ $t('send.model') }}
              </CLink>
            </td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import permission from '@/consts/permission'

export default {
  name: 'MonthList',
  inheritAttrs: false,
  inject: ['apiService', 'dateService'],
  data () {
    return {
      items: null,
      yearList: null,
      searchYear: null,
      searchMonth: null,
      currentYear: null,
      currentMonth: null,
      oldestYear: null,
      oldestMonth: null
    }
  },
  computed: {
    fields () {
      return [
        { key: 'name', label: this.$t('common.name') },
        { key: 'reservation_status', label: this.$t('reservation_status.model') },
        { key: 'schedule_status', label: this.$t('schedule_status.model') },
        { key: 'action', label: '' }
      ]
    },
    monthList () {
      return Array.from(Array(12), (v, i) => i + 1)
    },
    loaded () {
      return this.items
    },
    itemsFiltered () {
      return (this.items ?? []).filter(
        item => this.currentYear < item.year || (this.currentYear === item.year && this.currentMonth <= item.month)
      )
    },
    canWrite () {
      return this.$store.getters['auth/can'][permission.reservation.write]
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      const today = this.dateService.today()
      this.searchYear = this.dateService.year(today)
      this.searchMonth = this.dateService.month(today)
      this.yearList = Array.from(Array(4), (v, i) => this.searchYear - 2 + i)
      this.search()
    },
    search () {
      this.currentYear = this.searchYear
      this.currentMonth = this.searchMonth
      if (!this.oldestYear || this.oldestYear > this.currentYear || (this.oldestYear === this.currentYear && this.oldestMonth > this.currentMonth)) {
        this.load()
      }
    },
    async load () {
      try {
        this.$store.commit('processing/beginGet')
        this.items = await this.apiService.getMonthList(
          this.currentYear,
          this.currentMonth
        )
        this.oldestYear = this.currentYear
        this.oldestMonth = this.currentMonth
      } catch (e) {
        if (!this.apiService.isHandledError(e)) {
          throw e
        }
      } finally {
        this.$store.commit('processing/endGet')
      }
    }
  }
}
</script>
