<template>
  <CInput
    :id="id"
    horizontal
    :type="type"
    :label="label"
    :is-valid="validate"
    :invalid-feedback="invalidMessage"
    :value="value"
    @input="setValue"
  />
</template>

<script>
export default {
  name: 'MyText',
  mixins: [require('./input-mixin').default],
  props: {
    type: {
      type: String,
      default: 'text'
    }
  }
}
</script>
