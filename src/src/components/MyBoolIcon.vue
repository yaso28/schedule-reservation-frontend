<template>
  <CIcon :name="iconName" />
</template>

<script>
export default {
  name: 'MyBoolIcon',
  inheritAttrs: false,
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    iconName () {
      return this.value ? 'cilCheckAlt' : 'cilX'
    }
  }
}
</script>
