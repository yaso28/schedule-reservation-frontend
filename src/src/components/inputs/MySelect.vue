<template>
  <CSelect
    :id="id"
    horizontal
    :label="label"
    :is-valid="validate"
    :invalid-feedback="invalidMessage"
    :value="value"
    :options="mappedOptions"
    @update:value="setValue"
  />
</template>

<script>
export default {
  name: 'MySelect',
  mixins: [require('./input-mixin').default],
  props: {
    options: {
      type: Array,
      default: () => []
    },
    valueMapper: {
      type: Function,
      default: o => o.id
    },
    labelMapper: {
      type: Function,
      default: o => o.name
    }
  },
  computed: {
    mappedOptions () {
      const me = this
      const mapped = me.options.map(option => ({
        value: me.valueMapper(option),
        label: me.labelMapper(option)
      }))
      mapped.unshift({ value: null, label: '' })
      return mapped
    }
  }
}
</script>
