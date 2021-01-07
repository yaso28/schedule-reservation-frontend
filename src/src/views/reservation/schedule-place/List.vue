<template>
  <div>
    <slot name="h1" />

    <CCard>
      <CCardBody>
        <CDataTable
          :items="items"
          :fields="fields"
        >
          <template #price_per_hour="{item}">
            <td class="text-right text-nowrap">
              {{ $n(item.price_per_hour, "currency") }}
            </td>
          </template>
          <template #action="{item}">
            <td>
              <template v-if="canWrite">
                <CLink
                  class="btn btn-outline-primary"
                  :to="{ name: 'reservation.schedule-place.edit', params: { id: item.id } }"
                >
                  {{ $t('action.edit') }}
                </CLink>
                <CLink
                  class="btn btn-outline-primary"
                  :to="{ name: 'reservation.schedule-place.add', query: { original_id: item.id } }"
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
          :to="{ name: 'reservation.schedule-place.add'}"
        >
          {{ $t('action.add') }}
        </CLink>
        <CLink
          class="btn btn-outline-primary"
          :to="{ name: 'reservation.schedule-place.reorder'}"
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
  name: 'SchedulePlaceList',
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
        { key: 'abbreviation', label: this.$t('common.abbreviation') },
        { key: 'price_per_hour', label: this.$t('schedule_place.price_per_hour') },
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
        this.items = await this.apiService.getSchedulePlaceList()
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
