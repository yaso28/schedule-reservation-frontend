<template>
  <div>
    <MyTransition>
      <router-view>
        <template #h1>
          <h1>{{ subTitle }}</h1>
        </template>
      </router-view>
    </MyTransition>
  </div>
</template>

<script>
export default {
  name: 'MyPage',
  components: {
    MyTransition: require('@/components/wrappers/MyTransition').default
  },
  inheritAttrs: false,
  computed: {
    subTitle () {
      let result = this.$route.meta?.subTitle
      if (result) {
        const me = this
        result = result
          .split(' ')
          .filter(s => s.length > 0)
          .map(s => me.$t(s))
          .join('')
      }
      return result
    }
  },
  metaInfo () {
    const mainTitle = this.$t('organization_name')
    const result = {}
    if (this.subTitle) {
      result.title = this.subTitle
      result.titleTemplate = `${mainTitle} | %s`
    } else {
      result.title = mainTitle
      result.titleTemplate = null
    }

    const meta = []
    if (this.$route.meta?.seo) {
      meta.push({
        vmid: 'description',
        name: 'description',
        content: this.$t(this.$route.meta.seo.description)
      })
    } else {
      meta.push({ vmid: 'robots', name: 'robots', content: 'noindex' })
    }
    if (process.env.VUE_APP_IS_STAGING) {
      meta.push({ vmid: 'robots', name: 'robots', content: 'noindex' })
    }
    result.meta = meta

    return result
  }
}
</script>
