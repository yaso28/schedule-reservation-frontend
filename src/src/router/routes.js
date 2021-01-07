/**
 * このファイルを編集してルートを追加・変更・削除した場合は、
 * src/middlewares/navigationGuard/tests/NavigationGuard.spec.jsを編集して、
 * テスト対象のルートを追加・変更・削除してください。
 */

import permission from '@/consts/permission'

export default [
  {
    path: '/',
    name: 'home',
    meta: {
      subTitle: 'app_name',
      seo: {
        description: 'seo.home'
      }
    },
    component: () => import('@/views/Home')
  },
  {
    path: '/error/:code',
    name: 'error',
    component: () => import('@/views/Error'),
    props: true
  },
  {
    path: '/lv2au5ldfg-login',
    name: 'login',
    meta: {
      subTitle: 'action.login',
      guest: true
    },
    component: () => import('@/views/auth/Login')
  },
  {
    path: '/logout',
    name: 'logout',
    meta: {
      auth: true
    },
    component: () => import('@/views/auth/Logout')
  },
  {
    path: '/schedule',
    component: () => import('@/components/containers/MyEmptyParent'),
    children: [
      {
        path: 'list',
        name: 'schedule.list',
        meta: {
          subTitle: 'schedule.model',
          seo: {
            description: 'seo.schedule.list'
          }
        },
        component: () => import('@/views/schedule/List')
      }
    ]
  },
  {
    path: '/reservation',
    meta: {
      auth: true,
      can: permission.reservation.read
    },
    component: () => import('@/components/containers/MyEmptyParent'),
    children: [
      {
        path: 'month',
        component: () => import('@/components/containers/MyEmptyParent'),
        children: [
          {
            path: 'list',
            name: 'reservation.month.list',
            meta: {
              subTitle: 'month.model action.list'
            },
            component: () => import('@/views/reservation/month/List')
          },
          {
            path: 'send/:id',
            name: 'reservation.month.send',
            meta: {
              subTitle: 'send.model',
              can: permission.reservation.write
            },
            props: true,
            component: () => import('@/views/reservation/month/Send')
          }
        ]
      },
      {
        path: 'schedule',
        component: () => import('@/components/containers/MyEmptyParent'),
        children: [
          {
            path: 'list',
            name: 'reservation.schedule.list',
            meta: {
              subTitle: 'schedule.model action.list'
            },
            component: () => import('@/views/reservation/schedule/List')
          },
          {
            path: 'add-list',
            name: 'reservation.schedule.add-list',
            meta: {
              subTitle: 'schedule.model action.add',
              can: permission.reservation.write
            },
            component: () => import('@/views/reservation/schedule/AddList')
          },
          {
            path: 'edit/:id',
            name: 'reservation.schedule.edit',
            meta: {
              subTitle: 'schedule.model action.edit',
              can: permission.reservation.write
            },
            props: true,
            component: () => import('@/views/reservation/schedule/Edit')
          }
        ]
      },
      {
        path: 'reservation',
        component: () => import('@/components/containers/MyEmptyParent'),
        children: [
          {
            path: 'list',
            name: 'reservation.reservation.list',
            meta: {
              subTitle: 'reservation.model action.list'
            },
            component: () => import('@/views/reservation/reservation/List')
          },
          {
            path: 'split/:id',
            name: 'reservation.reservation.split',
            meta: {
              subTitle: 'reservation.model action.split',
              can: permission.reservation.write
            },
            props: true,
            component: () => import('@/views/reservation/reservation/Split')
          }
        ]
      },
      {
        path: 'schedule-status',
        component: () => import('@/components/containers/MyEmptyParent'),
        children: [
          {
            path: 'list',
            name: 'reservation.schedule-status.list',
            meta: {
              subTitle: 'schedule_status.model action.list'
            },
            component: () => import('@/views/reservation/schedule-status/List')
          }
        ]
      },
      {
        path: 'reservation-status',
        component: () => import('@/components/containers/MyEmptyParent'),
        children: [
          {
            path: 'list',
            name: 'reservation.reservation-status.list',
            meta: {
              subTitle: 'reservation_status.model action.list'
            },
            component: () => import('@/views/reservation/reservation-status/List')
          }
        ]
      },
      {
        path: 'reservation-organization',
        component: () => import('@/components/containers/MyEmptyParent'),
        children: [
          {
            path: 'list',
            name: 'reservation.reservation-organization.list',
            meta: {
              subTitle: 'reservation_organization.model action.list'
            },
            component: () => import('@/views/reservation/reservation-organization/List')
          },
          {
            path: 'add',
            name: 'reservation.reservation-organization.add',
            meta: {
              subTitle: 'reservation_organization.model action.add',
              can: permission.reservation.write
            },
            component: () => import('@/views/reservation/reservation-organization/Add')
          },
          {
            path: 'edit/:id',
            name: 'reservation.reservation-organization.edit',
            meta: {
              subTitle: 'reservation_organization.model action.edit',
              can: permission.reservation.write
            },
            props: true,
            component: () => import('@/views/reservation/reservation-organization/Edit')
          },
          {
            path: 'reorder',
            name: 'reservation.reservation-organization.reorder',
            meta: {
              subTitle: 'reservation_organization.model action.reorder',
              can: permission.reservation.write
            },
            props: true,
            component: () => import('@/views/reservation/reservation-organization/Reorder')
          }
        ]
      },
      {
        path: 'schedule-place',
        component: () => import('@/components/containers/MyEmptyParent'),
        children: [
          {
            path: 'list',
            name: 'reservation.schedule-place.list',
            meta: {
              subTitle: 'schedule_place.model action.list'
            },
            component: () => import('@/views/reservation/schedule-place/List')
          },
          {
            path: 'add',
            name: 'reservation.schedule-place.add',
            meta: {
              subTitle: 'schedule_place.model action.add',
              can: permission.reservation.write
            },
            component: () => import('@/views/reservation/schedule-place/Add')
          },
          {
            path: 'edit/:id',
            name: 'reservation.schedule-place.edit',
            meta: {
              subTitle: 'schedule_place.model action.edit',
              can: permission.reservation.write
            },
            props: true,
            component: () => import('@/views/reservation/schedule-place/Edit')
          },
          {
            path: 'reorder',
            name: 'reservation.schedule-place.reorder',
            meta: {
              subTitle: 'schedule_place.model action.reorder',
              can: permission.reservation.write
            },
            props: true,
            component: () => import('@/views/reservation/schedule-place/Reorder')
          }
        ]
      },
      {
        path: 'schedule-usage',
        component: () => import('@/components/containers/MyEmptyParent'),
        children: [
          {
            path: 'list',
            name: 'reservation.schedule-usage.list',
            meta: {
              subTitle: 'schedule_usage.model action.list'
            },
            component: () => import('@/views/reservation/schedule-usage/List')
          },
          {
            path: 'add',
            name: 'reservation.schedule-usage.add',
            meta: {
              subTitle: 'schedule_usage.model action.add',
              can: permission.reservation.write
            },
            component: () => import('@/views/reservation/schedule-usage/Add')
          },
          {
            path: 'edit/:id',
            name: 'reservation.schedule-usage.edit',
            meta: {
              subTitle: 'schedule_usage.model action.edit',
              can: permission.reservation.write
            },
            props: true,
            component: () => import('@/views/reservation/schedule-usage/Edit')
          },
          {
            path: 'reorder',
            name: 'reservation.schedule-usage.reorder',
            meta: {
              subTitle: 'schedule_usage.model action.reorder',
              can: permission.reservation.write
            },
            props: true,
            component: () => import('@/views/reservation/schedule-usage/Reorder')
          }
        ]
      },
      {
        path: 'schedule-timetable',
        component: () => import('@/components/containers/MyEmptyParent'),
        children: [
          {
            path: 'list',
            name: 'reservation.schedule-timetable.list',
            meta: {
              subTitle: 'schedule_timetable.model action.list'
            },
            component: () => import('@/views/reservation/schedule-timetable/List')
          },
          {
            path: 'add',
            name: 'reservation.schedule-timetable.add',
            meta: {
              subTitle: 'schedule_timetable.model action.add',
              can: permission.reservation.write
            },
            component: () => import('@/views/reservation/schedule-timetable/Add')
          },
          {
            path: 'edit/:id',
            name: 'reservation.schedule-timetable.edit',
            meta: {
              subTitle: 'schedule_timetable.model action.edit',
              can: permission.reservation.write
            },
            props: true,
            component: () => import('@/views/reservation/schedule-timetable/Edit')
          },
          {
            path: 'reorder',
            name: 'reservation.schedule-timetable.reorder',
            meta: {
              subTitle: 'schedule_timetable.model action.reorder',
              can: permission.reservation.write
            },
            props: true,
            component: () => import('@/views/reservation/schedule-timetable/Reorder')
          }
        ]
      },
      {
        path: 'setting',
        component: () => import('@/components/containers/MyEmptyParent'),
        children: [
          {
            path: 'edit',
            name: 'reservation.setting.edit',
            meta: {
              subTitle: 'common.setting',
              can: permission.reservation.write
            },
            component: () => import('@/views/reservation/setting/Edit')
          }
        ]
      }
    ]
  },
  {
    path: '*',
    name: '__invalid__',
    redirect: {
      name: 'error',
      params: { code: '404' }
    }
  }
]
