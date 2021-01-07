<template>
  <MyFormGroup
    :label="label"
    :form="form"
    :field="field"
  >
    <MySwitchNoWrapper
      :form="form"
      :field="field"
    />
  </MyFormGroup>
</template>

<script>
export default {
  name: 'MySwitch',
  components: {
    MyFormGroup: require('./MyFormGroup').default,
    MySwitchNoWrapper: require('./MySwitchNoWrapper').default
  },
  mixins: [require('./input-mixin').default]
}
</script>
