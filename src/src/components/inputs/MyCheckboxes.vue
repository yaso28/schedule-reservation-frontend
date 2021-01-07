<template>
  <MyFormGroup
    :label="label"
    :form="form"
    :field="field"
  >
    <MyCheckboxesNoWrapper
      :form="form"
      :field="field"
      :options="options"
      :value-mapper="valueMapper"
      :label-mapper="labelMapper"
      :inline="inline"
    >
      <template #label="{option}">
        <slot
          name="label"
          :option="option"
        />
      </template>
    </MyCheckboxesNoWrapper>
  </MyFormGroup>
</template>

<script>
export default {
  name: 'MyCheckboxes',
  components: {
    MyFormGroup: require('./MyFormGroup').default,
    MyCheckboxesNoWrapper: require('./MyCheckboxesNoWrapper').default
  },
  mixins: [require('./input-mixin').default],
  props: {
    options: {
      type: Array,
      required: true
    },
    valueMapper: {
      type: Function,
      default: o => o.id
    },
    labelMapper: {
      type: Function,
      default: o => o.name
    },
    inline: {
      type: Boolean,
      default: false
    }
  }
}
</script>
