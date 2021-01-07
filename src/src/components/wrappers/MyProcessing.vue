<template>
  <div class="position-relative">
    <slot />
    <CElementCover
      v-show="processing"
      :id="id"
      :style="`z-index: ${zIndex};`"
    >
      <CSpinner color="success" />
    </CElementCover>
  </div>
</template>

<script>
export default {
  name: 'MyProcessing',
  inheritAttrs: false,
  props: {
    processing: {
      type: Boolean,
      default: false
    },
    zIndex: {
      type: Number,
      default: 900
    },
    id: {
      type: [String, Boolean],
      default: false
    }
  }
}
</script>
