<template>
  <!-- post processing cover -->
  <MyProcessing
    id="processing-post"
    :processing="processingPost"
    :z-index="9999"
    class="c-app"
  >
    <!-- sidebar -->
    <MySidebar />
    <CWrapper>
      <!-- header -->
      <MyHeader />
      <!-- body -->
      <!-- get processing cover -->
      <MyProcessing
        id="processing-get"
        :processing="processingGet"
        class="c-body"
      >
        <main class="c-main">
          <CContainer fluid>
            <!-- alert -->
            <div id="alert-area">
              <CAlert
                v-for="alertValue in alertValues"
                :key="alertValue.key"
                :color="alertValue.type"
                close-button
              >
                {{ $t(alertValue.message) }}
              </CAlert>
            </div>

            <!-- main -->
            <MyPage />
          </CContainer>
        </main>
      </MyProcessing>
    </CWrapper>
  </MyProcessing>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'MyContainer',
  components: {
    MyProcessing: require('@/components/wrappers/MyProcessing').default,
    MySidebar: require('./MySidebar').default,
    MyHeader: require('./MyHeader').default,
    MyPage: require('./MyPage').default
  },
  inheritAttrs: false,
  computed: {
    ...mapState({
      processingGet: state => state.processing.get,
      processingPost: state => state.processing.post,
      alertValues: state => state.alert.values
    })
  }
}
</script>
