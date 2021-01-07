<template>
  <div id="app">
    <MyContainer />
  </div>
</template>

<script>
export default {
  name: 'MyApp',
  components: {
    MyContainer: require('@/components/containers/MyContainer').default
  },
  inheritAttrs: false
}
</script>

<style lang="scss">
// import Core UI
@import "~@coreui/coreui/scss/coreui";

// custom styles below

.nl2br {
  white-space: pre-line;
}

div.my-input-wrapper {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  border: 1px solid;
  border-color: transparent;
  border-radius: 0.25rem;
}

div.my-input-wrapper.is-invalid {
  padding-left: 0.25rem;
  border-color: $danger;

  @if $enable-validation-icons {
    @include ltr {
      padding-right: $input-height-inner;
    }

    @include rtl {
      padding-left: $input-height-inner;
    }

    background-image: escape-svg($form-feedback-icon-invalid);
    background-repeat: no-repeat;

    @include ltr {
      background-position: right $input-height-inner-quarter center;
    }

    @include rtl {
      background-position: left $input-height-inner-quarter center;
    }

    background-size: $input-height-inner-half $input-height-inner-half;
  }
}

td.my-inherits-above {
  border-top: none;
}
</style>
