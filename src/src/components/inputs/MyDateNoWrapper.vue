<template>
  <div class="d-flex">
    <input
      :id="id"
      type="date"
      class="form-control flex-grow-1"
      :value="value"
      @input="setValue($event.target.value)"
    >
    <CButton
      v-if="showClear"
      @click="setValue('')"
    >
      <CIcon name="cilTrash" />
    </CButton>
  </div>
</template>

<script>
export default {
  name: 'MyDateNoWrapper',
  mixins: [require('./input-mixin').default],
  props: {
    showClear: {
      type: Boolean,
      default: true
    }
  }
}
</script>
