<template>
  <div>
    <slot name="h1" />

    <CCard>
      <CCardBody>
        <CDataTable
          :items="items"
          :fields="fields"
        >
          <template #display_type="{item}">
            <td>
              <CBadge
                v-if="item.display_type"
                :color="item.display_type"
              >
                {{ item.display_type }}
              </CBadge>
            </td>
          </template>
          <template #is_public="{item}">
            <td>
              <MyBoolIcon :value="item.is_public" />
            </td>
          </template>
          <template #bulk_change_mode="{item}">
            <td>
              {{ $t(`schedule_status.bulk_change_mode.${item.bulk_change_mode}`) }}
            </td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
export default {
  name: 'ScheduleStatusList',
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
        { key: 'display_type', label: this.$t('schedule_status.display_type') },
        { key: 'is_public', label: this.$t('schedule_status.is_public') },
        { key: 'bulk_change_mode', label: this.$t('schedule_status.bulk_change_mode.model') }
      ]
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    async load () {
      try {
        this.$store.commit('processing/beginGet')
        this.items = await this.apiService.getScheduleStatusList()
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
