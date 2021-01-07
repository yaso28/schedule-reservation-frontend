<template>
  <div>
    <slot name="h1" />

    <CCard>
      <CCardBody>
        <CDataTable
          :items="items"
          :fields="fields"
        >
          <template #is_public="{item}">
            <td>
              <MyBoolIcon :value="item.is_public" />
            </td>
          </template>
          <template #reservation_organization="{item}">
            <td>
              {{ item.reservation_organization.name }}
            </td>
          </template>
          <template #action="{item}">
            <td>
              <template v-if="canWrite">
                <CLink
                  class="btn btn-outline-primary"
                  :to="{ name: 'reservation.schedule-usage.edit', params: { id: item.id } }"
                >
                  {{ $t('action.edit') }}
                </CLink>
                <CLink
                  class="btn btn-outline-primary"
                  :to="{ name: 'reservation.schedule-usage.add', query: { original_id: item.id } }"
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
          :to="{ name: 'reservation.schedule-usage.add'}"
        >
          {{ $t('action.add') }}
        </CLink>
        <CLink
          class="btn btn-outline-primary"
          :to="{ name: 'reservation.schedule-usage.reorder'}"
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
  name: 'ScheduleUsageList',
  components: {
    MyBoolIcon: require('@/components/MyBoolIcon').default
  },
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
        { key: 'is_public', label: this.$t('schedule_usage.is_public') },
        { key: 'reservation_organization', label: this.$t('reservation_organization.model') },
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
        this.items = await this.apiService.getScheduleUsageList()
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
