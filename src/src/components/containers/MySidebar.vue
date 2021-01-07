<template>
  <CSidebar
    :show="show"
    @update:show="showChanged"
  >
    <!-- title -->
    <CSidebarBrand>
      <span class="ml-2 font-weight-bold">{{ $t('organization_name') }}</span>
    </CSidebarBrand>

    <!-- menu begin -->
    <CSidebarNav>
      <!-- home -->
      <CSidebarNavItem
        :name="$t('home')"
        :to="{ name: 'home' }"
      />

      <!-- schedule -->
      <CSidebarNavItem
        :name="$t('schedule.model')"
        :to="{ name: 'schedule.list' }"
      />

      <!-- reservation begin -->
      <CSidebarNavDropdown
        v-if="can[permission.reservation.read]"
        :name="$t('reservation.model')"
        route="reservation"
      >
        <CSidebarNavItem
          :name="translateWords('month.model action.list')"
          :to="{ name:'reservation.month.list' }"
        />
        <CSidebarNavItem
          :name="translateWords('schedule.model action.list')"
          :to="{ name:'reservation.schedule.list' }"
        />
        <CSidebarNavItem
          :name="translateWords('reservation.model action.list')"
          :to="{ name:'reservation.reservation.list' }"
        />
        <CSidebarNavItem
          :name="$t('schedule_status.model')"
          :to="{ name:'reservation.schedule-status.list' }"
        />
        <CSidebarNavItem
          :name="$t('reservation_status.model')"
          :to="{ name:'reservation.reservation-status.list' }"
        />
        <CSidebarNavItem
          :name="$t('reservation_organization.model')"
          :to="{ name:'reservation.reservation-organization.list' }"
        />
        <CSidebarNavItem
          :name="$t('schedule_place.model')"
          :to="{ name:'reservation.schedule-place.list' }"
        />
        <CSidebarNavItem
          :name="$t('schedule_usage.model')"
          :to="{ name:'reservation.schedule-usage.list' }"
        />
        <CSidebarNavItem
          :name="$t('schedule_timetable.model')"
          :to="{ name:'reservation.schedule-timetable.list' }"
        />
        <CSidebarNavItem
          v-if="can[permission.reservation.write]"
          :name="$t('common.setting')"
          :to="{ name:'reservation.setting.edit' }"
        />
      </CSidebarNavDropdown>
      <!-- reservation end -->
    </CSidebarNav>
    <!-- menu end -->
  </CSidebar>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import permission from '@/consts/permission'

export default {
  name: 'MySidebar',
  computed: {
    ...mapState({
      show: state => state.sidebar.show
    }),
    ...mapGetters({
      isLogin: 'auth/isLogin',
      can: 'auth/can'
    }),
    permission () {
      return permission
    }
  },
  methods: {
    translateWords (name) {
      const me = this
      return name.split(' ')
        .filter(s => s.length > 0)
        .map(s => me.$t(s))
        .join('')
    },
    showChanged (value) {
      this.$store.commit('sidebar/set', value)
    }
  }
}
</script>
