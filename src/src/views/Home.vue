<template>
  <div class="home">
    <h1>{{ $t('organization_name') }} {{ $t('app_name') }}</h1>

    <CCard
      accent-color="primary"
      class="mt-4"
    >
      <CCardBody>
        <p>
          練習会場予約状況の管理および練習予定の公開を行うWebシステムです。<br>
          （ポートフォリオ用のデモサイトです。）
        </p>

        <div class="my-2">
          <CButton
            color="primary"
            variant="outline"
            @click="showGuest = !showGuest"
          >
            ゲストができること
          </CButton>
          <CCollapse :show="showGuest">
            <CListGroup>
              <CListGroupItem
                v-for="item in guestActions"
                :key="item.text"
                class="text-body"
                :to="item.to"
              >
                {{ item.text }}
              </CListGroupItem>
            </CListGroup>
          </CCollapse>
        </div>

        <div class="my-2">
          <CButton
            color="primary"
            variant="outline"
            @click="showAdmin = !showAdmin"
          >
            システム管理者(*1)ができること
          </CButton>
          <CCollapse :show="showAdmin">
            <CListGroup>
              <CListGroupItem
                v-for="item in adminActions"
                :key="item.text"
                class="text-body"
                :to="item.to"
              >
                {{ item.text }}
              </CListGroupItem>
            </CListGroup>
            <ul class="list-unstyled ml-1">
              <li>
                (*1) ログインID：admin パスワード：admin$28
              </li>
              <li>
                (*2) 先行予約できるのは合計＊時間までといった上限がある施設にて時間帯を分けて予約する場合に利用します。<br>
                （例：6時間のうち3時間を先行予約しておき、1ヶ月前を過ぎ上限が無くなってから残り3時間を予約する。）
              </li>
            </ul>
          </CCollapse>
        </div>

        <div class="my-2">
          <CButton
            color="info"
            variant="outline"
            @click="showSource = !showSource"
          >
            ソースコード
          </CButton>
          <CCollapse :show="showSource">
            <CListGroup>
              <CListGroupItem
                v-for="item in sourceLinks"
                :key="item.text"
                class="text-body"
                :href="item.href"
                target="_blank"
              >
                {{ item.text }}
              </CListGroupItem>
            </CListGroup>
          </CCollapse>
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
export default {
  name: 'MyHome',
  data () {
    return {
      showGuest: false,
      showAdmin: false,
      showSource: false
    }
  },
  computed: {
    guestActions () {
      return [
        ['練習予定の閲覧', 'schedule.list']
      ].map(item => ({ text: item[0], to: { name: item[1] } }))
    },
    adminActions () {
      return [
        ['練習予定の追加・編集', 'reservation.schedule.list'],
        ['会場予約の編集・分割(*2)', 'reservation.reservation.list'],
        ['月別練習予定のメール送信', 'reservation.month.list']
      ].map(item => ({ text: item[0], to: { name: item[1] } }))
    },
    sourceLinks () {
      return [
        ['フロントエンド', 'https://github.com/yaso28/schedule-reservation-frontend'],
        ['バックエンド', 'https://github.com/yaso28/schedule-reservation-backend']
      ].map(item => ({ text: item[0], href: item[1] }))
    }
  }
}
</script>
