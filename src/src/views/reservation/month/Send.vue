<template>
  <div>
    <slot name="h1" />

    <CForm
      v-if="loaded"
      @submit.prevent="showConfirm = true"
    >
      <CCard>
        <CCardBody>
          <dl class="row">
            <dt class="col-sm-3">
              {{ $t('month.model') }}
            </dt>
            <dd class="col-sm-9">
              {{ month.name }}
            </dd>
            <dt class="col-sm-3">
              {{ $t('reservation_status.model') }}
            </dt>
            <dd class="col-sm-9">
              {{ month.reservation_status.name }}
            </dd>
            <dt class="col-sm-3">
              {{ $t('schedule_status.model') }}
            </dt>
            <dd class="col-sm-9">
              {{ month.schedule_status.name }}
            </dd>
          </dl>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardBody>
          <MyText
            :label="$t('send.mail_to')"
            :form="form"
            field="mail_to"
          />
          <MyText
            :label="$t('send.subject')"
            :form="form"
            field="subject"
          />
          <MyTextarea
            :label="$t('send.message')"
            :form="form"
            field="message"
            :rows="40"
          />

          <ul>
            <li>
              {{ $t('send.statement.setting') }}<CLink :to="{name: 'reservation.setting.edit'}">
                {{ $t('common.here') }}
              </CLink>
            </li>
          </ul>
        </CCardBody>
        <CCardFooter>
          <CButton
            class="btn-reset"
            color="secondary"
            @click="form.reset()"
          >
            {{ $t("action.reset") }}
          </CButton>
          <CButton
            type="submit"
            color="primary"
          >
            {{ $t('action.send') }}
          </CButton>
        </CCardFooter>
      </CCard>
    </CForm>

    <CModal
      :show.sync="showConfirm"
      color="primary"
      centered
      size="sm"
      :title="$t('message.send.confirm')"
      @update:show="onModalShowChange"
    >
      <template #body-wrapper>
        <div />
      </template>
    </CModal>
  </div>
</template>

<script>
export default {
  name: 'MonthSend',
  components: {
    MyText: require('@/components/inputs/MyText').default,
    MyTextarea: require('@/components/inputs/MyTextarea').default
  },
  inheritAttrs: false,
  inject: ['apiService'],
  props: {
    id: {
      type: [Number, String],
      required: true
    }
  },
  data () {
    return {
      month: null,
      form: null,
      showConfirm: false
    }
  },
  computed: {
    loaded () {
      return this.month && this.form
    }
  },
  watch: {
    id () {
      this.load()
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    async load () {
      try {
        this.$store.commit('processing/beginGet')
        const info = await this.apiService.prepareMonthScheduleSendInfo(this.id)
        this.month = info.month
        this.form = this.apiService.makeForm({
          mail_to: info.mail_to,
          subject: info.subject,
          message: info.message
        })
      } catch (error) {
        if (!this.apiService.isHandledError(error)) {
          throw error
        }
      } finally {
        this.$store.commit('processing/endGet')
      }
    },
    onModalShowChange (isShow, event, isOk) {
      if (isOk) {
        this.send()
      }
    },
    async send () {
      try {
        this.$store.commit('processing/beginPost')
        this.$store.commit('alert/clear')
        await this.apiService.sendMonthSchedule(this.id, this.form)
        this.$store.dispatch('alert/sendSuccess')
        this.$router.push({ name: 'reservation.month.list' })
      } catch (error) {
        if (!this.apiService.isHandledError(error)) {
          throw error
        }
      } finally {
        this.$store.commit('processing/endPost')
      }
    }
  }
}
</script>
