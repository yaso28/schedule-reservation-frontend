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
                  :to="{ name: 'reservation.reservation-organization.edit', params: { id: item.id } }"
                >
                  {{ $t('action.edit') }}
                </CLink>
                <CLink
                  class="btn btn-outline-primary"
                  :to="{ name: 'reservation.reservation-organization.add', query: { original_id: item.id } }"
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
          :to="{ name: 'reservation.reservation-organization.add'}"
        >
          {{ $t('action.add') }}
        </CLink>
        <CLink
          class="btn btn-outline-primary"
          :to="{ name: 'reservation.reservation-organization.reorder'}"
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
  name: 'ReservationOrganizationList',
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
        { key: 'registration_number', label: this.$t('reservation_organization.registration_number') },
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
        this.items = await this.apiService.getReservationOrganizationList()
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
