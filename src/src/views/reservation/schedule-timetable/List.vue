<template>
  <div>
    <slot name="h1" />

    <CCard>
      <CCardBody>
        <CDataTable
          :items="items"
          :fields="fields"
        >
          <template #action="{item}">
            <td>
              <template v-if="canWrite">
                <CLink
                  class="btn btn-outline-primary"
                  :to="{ name: 'reservation.schedule-timetable.edit', params: { id: item.id } }"
                >
                  {{ $t('action.edit') }}
                </CLink>
                <CLink
                  class="btn btn-outline-primary"
                  :to="{ name: 'reservation.schedule-timetable.add', query: { original_id: item.id } }"
                >
                  {{ $t('action.copy') }}
                </CLink>
              </template>
            </td>
          </template>
        </CDataTable>
      </CCardBody>
      <CCardFooter v-if="canWrite">
        <CLink
          class="btn btn-outline-primary"
          :to="{ name: 'reservation.schedule-timetable.add'}"
        >
          {{ $t('action.add') }}
        </CLink>
        <CLink
          class="btn btn-outline-primary"
          :to="{ name: 'reservation.schedule-timetable.reorder'}"
        >
          {{ $t('action.reorder') }}
        </CLink>
      </CCardFooter>
    </CCard>
  </div>
</template>

<script>
import permission from '@/consts/permission'

export default {
  name: 'ScheduleTimetableList',
  inheritAttrs: false,
  inject: ['apiService'],
  data () {
    return {
      items: []
    }
  },
  computed: {
    fields () {
      return [
        { key: 'name', label: this.$t('common.name') },
        { key: 'details', label: this.$t('schedule_timetable.details'), _classes: 'nl2br' },
        { key: 'action', label: '' }
      ]
    },
    canWrite () {
      return this.$store.getters['auth/can'][permission.reservation.write]
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    async load () {
      try {
        this.$store.commit('processing/beginGet')
        this.items = await this.apiService.getScheduleTimetableList()
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
