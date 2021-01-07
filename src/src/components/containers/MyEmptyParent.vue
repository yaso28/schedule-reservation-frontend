<template>
  <router-view>
    <template #h1>
      <slot name="h1" />
    </template>
  </router-view>
</template>

<script>
export default {
  name: 'MyEmptyParent'
}
</script>
