<template>
  <MyFormGroup
    :label="label"
    :form="form"
    :field="field"
    :label-for="id"
  >
    <MyArrayNoWrapper
      :form="form"
      :field="field"
      :allows-empty="allowsEmpty"
      :distinct="distinct"
      :items-sorter="itemsSorter"
    >
      <template #default="{innerForm, innerField}">
        <slot
          :innerForm="innerForm"
          :innerField="innerField"
        />
      </template>
      <template #listItem="{item}">
        <slot
          name="listItem"
          :item="item"
        />
      </template>
    </MyArrayNoWrapper>
  </MyFormGroup>
</template>

<script>
export default {
  name: 'MyArray',
  components: {
    MyFormGroup: require('./MyFormGroup').default,
    MyArrayNoWrapper: require('./MyArrayNoWrapper').default
  },
  mixins: [require('./input-mixin').default],
  props: {
    allowsEmpty: {
      type: Boolean,
      default: false
    },
    distinct: {
      type: Boolean,
      default: true
    },
    itemsSorter: {
      type: [Function, Boolean],
      default: (item1, item2) => {
        if (item1 < item2) {
          return -1
        } else if (item1 > item2) {
          return 1
        } else {
          return 0
        }
      }
    }
  }
}
</script>
