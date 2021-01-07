<template>
  <CInput
    :id="id"
    type="number"
    horizontal
    :label="label"
    :is-valid="validate"
    :invalid-feedback="invalidMessage"
    :value="value"
    :min="min"
    :max="max"
    :step="step"
    @input="setValue"
  />
</template>

<script>
export default {
  name: 'MyNumber',
  mixins: [require('./input-mixin').default],
  props: {
    min: {
      type: [Number, Boolean],
      default: false
    },
    max: {
      type: [Number, Boolean],
      default: false
    },
    step: {
      type: Number,
      default: 1
    }
  }
}
</script>
