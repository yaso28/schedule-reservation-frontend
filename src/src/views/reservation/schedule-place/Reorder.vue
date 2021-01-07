<template>
  <div>
    <slot name="h1" />

    <MyReorderForm
      v-if="items"
      :items="items"
      @submit="save"
    />
  </div>
</template>

<script>
export default {
  name: 'SchedulePlaceReorder',
  components: {
    MyReorderForm: require('@/components/MyReorderForm').default
  },
  inheritAttrs: false,
  inject: ['apiService'],
  data () {
    return {
      items: null
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
      } catch (error) {
        if (!this.apiService.isHandledError(error)) {
          throw error
        }
      } finally {
        this.$store.commit('processing/endGet')
      }
    },
    async save (form) {
      try {
        this.$store.commit('processing/beginPost')
        this.$store.commit('alert/clear')
        await this.apiService.reorderSchedulePlace(form)
        this.$store.dispatch('alert/saveSuccess')
        this.$router.push({ name: 'reservation.schedule-place.list' })
      } catch (error) {
        if (!this.apiService.isHandledError(error)) {
          throw error
        }
      } finally {
        this.$store.commit('processing/endPost')
      }
    }
  }
}
</script>
