import { mount } from '@vue/test-utils'
import MyPage from '@/components/containers/MyPage'

class PageTester {
  async mount (pageComponent, route, mountOption) {
    await mountOption.router.push(route)
    const pageWrapper = mount(MyPage, mountOption)
    return pageWrapper.findComponent(pageComponent)
  }

  assertTitleTag () {
    expect(document.title).toMatchSnapshot()
  }

  assertMetaTags () {
    expect(document.querySelectorAll('meta[data-vue-meta]')).toMatchSnapshot()
  }
}

export default new PageTester()
