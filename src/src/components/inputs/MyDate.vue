<template>
  <MyFormGroup
    :label="label"
    :form="form"
    :field="field"
    :label-for="id"
  >
    <MyDateNoWrapper
      :form="form"
      :field="field"
      :show-clear="showClear"
    />
  </MyFormGroup>
</template>

<script>
export default {
  name: 'MyDate',
  components: {
    MyFormGroup: require('./MyFormGroup').default,
    MyDateNoWrapper: require('./MyDateNoWrapper').default
  },
  mixins: [require('./input-mixin').default],
  props: {
    showClear: {
      type: Boolean,
      default: true
    }
  }
}
</script>
