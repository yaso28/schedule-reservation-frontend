<template>
  <transition
    name="fade"
    mode="out-in"
  >
    <slot />
  </transition>
</template>

<script>
export default {
  name: 'MyTransition'
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
