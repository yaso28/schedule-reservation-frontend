<template>
  <CInput
    :id="id"
    type="time"
    horizontal
    :label="label"
    :is-valid="validate"
    :invalid-feedback="invalidMessage"
    :value="value"
    :step="stepMinute * 60"
    @input="setValue"
  />
</template>

<script>
export default {
  name: 'MyTime',
  mixins: [require('./input-mixin').default],
  props: {
    stepMinute: {
      type: Number,
      default: 15
    }
  }
}
</script>
