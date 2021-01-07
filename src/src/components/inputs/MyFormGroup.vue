<template>
  <CRow
    form
    class="form-group"
  >
    <CCol
      tag="label"
      sm="3"
      class="col-form-label"
      :for="labelFor"
    >
      {{ label }}
    </CCol>
    <CCol sm="9">
      <div
        class="my-input-wrapper"
        :class="{ 'is-invalid': isInvalid }"
      >
        <slot />
      </div>
      <div
        v-if="isInvalid"
        class="invalid-feedback"
      >
        {{ invalidMessage }}
      </div>
    </CCol>
  </CRow>
</template>

<script>
export default {
  name: 'MyFormGroup',
  mixins: [require('./input-mixin').default],
  props: {
    labelFor: {
      type: String,
      default: ''
    }
  }
}
</script>
