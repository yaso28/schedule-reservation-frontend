<template>
  <div>
    <slot name="h1" />

    <CForm
      v-if="loaded"
      @submit.prevent="save"
    >
      <CCard>
        <CCardBody>
          <div
            v-for="setting in settingList"
            :key="`${setting.category}-${setting.key}`"
            v-c-tooltip="{
              content: setting.record.description,
              placement: 'top'
            }"
          >
            <MyText
              v-if="setting.rows <= 1"
              :label="$t(setting.label)"
              :form="setting.form"
              field="value"
              :id-prefix="`${setting.category}-${setting.key}`"
            />
            <MyTextarea
              v-if="setting.rows > 1"
              :label="$t(setting.label)"
              :form="setting.form"
              field="value"
              :id-prefix="`${setting.category}-${setting.key}`"
              :rows="setting.rows"
            />
          </div>
        </CCardBody>
        <CCardFooter>
          <CButton
            class="btn-reset"
            color="secondary"
            @click="reset"
          >
            {{ $t("action.reset") }}
          </CButton>
          <CButton
            type="submit"
            color="primary"
          >
            {{ $t('action.save') }}
          </CButton>
        </CCardFooter>
      </CCard>
    </CForm>
  </div>
</template>

<script>
import setting from '@/consts/setting'

export default {
  name: 'ReservationSettingEdit',
  components: {
    MyText: require('@/components/inputs/MyText').default,
    MyTextarea: require('@/components/inputs/MyTextarea').default
  },
  inheritAttrs: false,
  inject: ['apiService'],
  data () {
    return {
      settingList: [
        [setting.reservation.category, setting.reservation.mail_to, 'send.mail_to', 1],
        [setting.reservation.category, setting.reservation.mail_subject, 'send.subject', 1],
        [setting.reservation.category, setting.reservation.mail_message_begin, 'send.message_begin', 5],
        [setting.reservation_public.category, setting.reservation_public.notes, 'common.notes', 5],
        [setting.reservation.category, setting.reservation.mail_message_end, 'send.message_end', 5]
      ].map(([category, key, label, rows]) => ({ category, key, label, rows, record: null, form: null })),
      loaded: false
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    async load () {
      try {
        this.$store.commit('processing/beginGet')
        const records = await Promise.all(this.settingList.map(setting => this.apiService.getSetting(setting.category, setting.key)))
        for (let i = 0; i < this.settingList.length; i++) {
          this.settingList[i].record = records[i]
          this.settingList[i].form = this.apiService.makeForm({ value: records[i].value })
        }
        this.loaded = true
      } catch (error) {
        if (!this.apiService.isHandledError(error)) {
          throw error
        }
      } finally {
        this.$store.commit('processing/endGet')
      }
    },
    reset () {
      for (let i = 0; i < this.settingList.length; i++) {
        this.settingList[i].form.reset()
      }
    },
    async save () {
      try {
        this.$store.commit('processing/beginPost')
        this.$store.commit('alert/clear')
        await Promise.all(this.settingList.map(setting => this.apiService.updateSetting(setting.category, setting.key, setting.form)))
        this.$store.dispatch('alert/saveSuccessNoRedirect')
        for (let i = 0; i < this.settingList.length; i++) {
          this.settingList[i].form.setInit()
        }
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
