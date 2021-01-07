<template>
  <CTextarea
    :id="id"
    horizontal
    :label="label"
    :is-valid="validate"
    :invalid-feedback="invalidMessage"
    :value="value"
    :rows="rows"
    @input="setValue"
  />
</template>

<script>
export default {
  name: 'MyTextarea',
  mixins: [require('./input-mixin').default],
  props: {
    rows: {
      type: Number,
      default: 3
    }
  }
}
</script>
