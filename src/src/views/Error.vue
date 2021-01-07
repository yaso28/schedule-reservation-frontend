<template>
  <div>
    <CAlert color="danger">
      {{ $t(`message.error.${code}`) }}
    </CAlert>
  </div>
</template>

<script>
export default {
  name: 'MyError',
  props: {
    code: {
      type: String,
      required: true
    }
  }
}
</script>
