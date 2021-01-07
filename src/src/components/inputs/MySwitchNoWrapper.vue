<template>
  <CSwitch
    :id="id"
    :checked="value"
    color="primary"
    :label-on="'\u2713'"
    :label-off="'\u2715'"
    @update:checked="setValue"
  />
</template>

<script>
export default {
  name: 'MySwitchNoWrapper',
  mixins: [require('./input-mixin').default]
}
</script>
