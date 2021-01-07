<template>
  <CHeader>
    <!-- sidebar toggler begin -->
    <CToggler
      id="toggle-sidebar-mobile"
      in-header
      class="ml-3 d-lg-none"
      @click="toggleMobile"
    />
    <CToggler
      id="toggle-sidebar-desktop"
      in-header
      class="ml-3 d-md-down-none"
      @click="toggleDesktop"
    />
    <!-- sidebar toggler end -->

    <!-- usermenu dropdown begin -->
    <CHeaderNav class="mr-3 ml-auto">
      <CDropdown
        id="usermenu-dropdown"
        in-nav
        class="c-header-nav-items"
        placement="bottom-end"
        :toggler-text="usermenuText"
        add-toggler-classes="c-header-nav-link"
        add-menu-classes="pt-0"
      >
        <template v-if="isLogin">
          <CDropdownItem :to="{ name: 'logout' }">
            {{ $t('action.logout') }}
          </CDropdownItem>
        </template>
        <template v-else>
          <CDropdownItem :to="{ name: 'login' }">
            {{ $t('action.login') }}
          </CDropdownItem>
        </template>
      </CDropdown>
    </CHeaderNav>
    <!-- usermenu dropdown end -->
  </CHeader>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'MyHeader',
  computed: {
    ...mapState({
      user: state => state.auth.user
    }),
    ...mapGetters({
      isLogin: 'auth/isLogin'
    }),
    usermenuText () {
      return this.isLogin ? this.user.name : this.$t('user.guest')
    }
  },
  methods: {
    toggleMobile () {
      this.$store.commit('sidebar/toggleMobile')
    },
    toggleDesktop () {
      this.$store.commit('sidebar/toggleDesktop')
    }
  }
}
</script>
