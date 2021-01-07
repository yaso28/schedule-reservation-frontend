<template>
  <div class="list-modal-bulk-stub" />
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      default: () => []
    },
    scheduleStatusList: {
      type: Array,
      default: () => []
    }
  }
}
</script>
