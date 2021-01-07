<template>
  <CForm @submit.prevent="save">
    <CCard>
      <CCardBody>
        <transition-group
          name="reorder"
          tag="CListGroup"
        >
          <CListGroupItem
            v-for="(item, index) in editingItems"
            :key="item.value"
          >
            <CButton
              :id="`btn-up-${item.value}`"
              color="info"
              variant="outline"
              size="sm"
              class="mr-1"
              @click="swap(index)"
            >
              <CIcon name="cilArrowThickTop" />
            </CButton>
            <CButton
              :id="`btn-down-${item.value}`"
              color="info"
              variant="outline"
              size="sm"
              class="mr-2"
              @click="swap(index + 1)"
            >
              <CIcon name="cilArrowThickBottom" />
            </CButton>
            {{ item.label }}
          </CListGroupItem>
        </transition-group>
      </CCardBody>
      <CCardFooter>
        <CButton
          id="btn-reset"
          color="secondary"
          @click="load"
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
</template>

<script>
export default {
  name: 'MyReorderForm',
  inheritAttrs: false,
  inject: ['apiService'],
  props: {
    items: {
      type: Array,
      required: true
    },
    valueMapper: {
      type: Function,
      default: o => o.id
    },
    labelMapper: {
      type: Function,
      default: o => o.name
    }
  },
  data () {
    return {
      editingItems: []
    }
  },
  watch: {
    items () {
      this.load()
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    load () {
      const me = this
      me.editingItems = me.items.map(item => ({
        value: me.valueMapper(item),
        label: me.labelMapper(item)
      }))
    },
    swap (index) {
      if (index <= 0 || index >= this.editingItems.length) {
        return
      }
      this.editingItems.splice(index - 1, 2, this.editingItems[index], this.editingItems[index - 1])
    },
    save () {
      const form = this.apiService.makeForm({
        id_list: this.editingItems.map(item => item.value)
      })
      this.$emit('submit', form)
    }
  }
}
</script>

<style lang="scss" scoped>
.reorder-move {
  transition: transform 0.5s;
}
</style>
