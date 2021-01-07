<template>
  <div>
    <div
      v-for="option in mappedOptions"
      :key="option.value"
      class="form-check"
      :class="{ 'form-check-inline': inline }"
    >
      <input
        :id="`${id}-${option.value}`"
        v-model="checkedValues"
        type="checkbox"
        class="form-check-input"
        :value="option.value"
      >
      <label
        class="form-check-label"
        :for="`${id}-${option.value}`"
      >
        <slot
          name="label"
          :option="option.raw"
        >
          {{ option.label }}
        </slot>
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyCheckboxesNoWrapper',
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
  },
  computed: {
    mappedOptions () {
      const me = this
      const mapped = me.options.map(option => ({
        value: me.valueMapper(option),
        label: me.labelMapper(option),
        raw: option
      }))
      return mapped
    },
    checkedValues: {
      get () {
        return this.value
      },
      set (newValues) {
        this.setValue(newValues)
      }
    }
  }
}
</script>
