<template>
  <div>
    <slot name="h1" />

    <CCard>
      <CCardBody>
        <CDataTable
          :items="items"
          :fields="fields"
        >
          <template #reserved="{item}">
            <td>
              <MyBoolIcon :value="item.reserved" />
            </td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
export default {
  name: 'ReservationStatusList',
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
        { key: 'description', label: this.$t('reservation_status.description') },
        { key: 'reserved', label: this.$t('reservation_status.reserved') }
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
        this.items = await this.apiService.getReservationStatusList()
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
