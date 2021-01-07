<template>
  <CBadge
    v-if="color"
    :color="color"
  >
    {{ status.name }}
  </CBadge>
</template>

<script>
export default {
  name: 'MyScheduleStatusBadge',
  inheritAttrs: false,
  props: {
    status: {
      type: Object,
      required: true
    },
    defaultColor: {
      type: String,
      default: null
    }
  },
  computed: {
    color () {
      let color = this.status.display_type
      if (!color) {
        color = this.defaultColor
      }
      return color
    }
  }
}
</script>

<style lang="scss" scoped>
.badge {
  font-size: 100%;
}
</style>
