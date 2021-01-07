<template>
  <div class="list-modal-details-stub" />
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    schedule: {
      type: Object,
      default: () => null
    }
  }
}
</script>
