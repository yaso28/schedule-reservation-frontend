<template>
  <CModal
    :show="visible"
    :title="$t('action.bulk_change')"
    color="primary"
    centered
    @update:show="updateShow"
  >
    <CButton
      class="show-target"
      color="info"
      variant="outline"
      @click="toggleTarget"
    >
      {{ $t('action.bulk_change') }}{{ $t('common.target') }}
    </CButton>
    <CCollapse
      :show="showTarget"
    >
      <CDataTable
        v-if="items"
        :items="items"
        :fields="fields"
        :header="false"
        add-table-classes="mt-2 mb-0 text-nowrap"
      >
        <template #ymd="{item}">
          <td>
            <MyDateSpan :value="item.schedule.ymd" />
          </td>
        </template>
        <template #time="{item}">
          <td>
            {{ item.begins_at }} - {{ item.ends_at }}
          </td>
        </template>
        <template #schedule_place="{item}">
          <td>
            {{ item.schedule.schedule_place.name }}
          </td>
        </template>
        <template #reservation_status="{item}">
          <td>
            {{ item.reservation_status.name }}
          </td>
        </template>
      </CDataTable>
      <CButton
        class="hide-target"
        color="info"
        variant="outline"
        @click="toggleTarget"
      >
        {{ $t('action.hide') }}
      </CButton>
    </CCollapse>

    <hr class="mt-2 mb-3">

    <div v-if="form">
      <MySelect
        v-if="reservationStatusList"
        :label="$t('reservation_status.model')"
        :form="form"
        field="reservation_status_id"
        :options="reservationStatusList"
      />
    </div>
    <template #footer>
      <CButton
        class="btn-save"
        type="submit"
        color="primary"
        @click="save"
      >
        {{ $t('action.save') }}
      </CButton>
    </template>
  </CModal>
</template>

<script>
export default {
  name: 'ListModalBulk',
  components: {
    MyDateSpan: require('@/components/MyDateSpan').default,
    MySelect: require('@/components/inputs/MySelect').default
  },
  inheritAttrs: false,
  inject: ['apiService'],
  props: {
    show: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      default: () => []
    },
    reservationStatusList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      visible: this.show,
      form: null,
      showTarget: false
    }
  },
  computed: {
    fields () {
      return [
        { key: 'ymd', label: this.$t('schedule.ymd') },
        { key: 'time', label: this.$t('schedule.time') },
        { key: 'schedule_place', label: this.$t('schedule_place.model') },
        { key: 'reservation_status', label: this.$t('reservation_status.model') }
      ]
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
    onShow () {
      if (!this.items || !this.reservationStatusList) {
        this.updateShow(false)
        return
      }
      this.form = this.apiService.makeForm({
        id_list: this.items.map(item => item.id),
        reservation_status_id: null
      })
      this.showTarget = this.items.length <= 5
      this.visible = true
    },
    onHide () {
      this.visible = false
      this.showTarget = false
    },
    toggleTarget () {
      this.showTarget = !this.showTarget
    },
    async save () {
      try {
        this.$store.commit('alert/clear')
        this.$store.commit('processing/beginPost')
        await this.apiService.bulkChangeReservation(this.form)
        this.$store.dispatch('alert/saveSuccessNoRedirect')
        this.updateShow(false)
        this.$emit('save')
      } catch (e) {
        if (!this.apiService.isHandledError(e)) {
          throw e
        }
      } finally {
        this.$store.commit('processing/endPost')
      }
    }
  }
}
</script>
