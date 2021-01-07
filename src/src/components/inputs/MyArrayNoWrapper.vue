<template>
  <div>
    <div
      v-if="innerForm"
      v-c-tooltip="{
        content: $t('message.btn_add_required'),
        placement: 'top'
      }"
      class="d-flex"
    >
      <div class="flex-grow-1">
        <slot
          :innerForm="innerForm"
          :innerField="innerField"
        />
      </div>
      <CButton
        class="btn-array-add"
        color="info"
        variant="outline"
        @click="addItem"
      >
        {{ $t('action.add') }}
      </CButton>
    </div>

    <CListGroup class="my-array-items">
      <CListGroupItem
        v-for="(item, index) in value"
        :key="getListKey(item)"
        class="d-flex align-items-center py-1"
      >
        <span class="flex-grow-1">
          <slot
            name="listItem"
            :item="item"
          >
            {{ item }}
          </slot>
        </span>
        <CButton
          class="btn-array-delete"
          color="info"
          variant="outline"
          size="sm"
          @click="deleteItem(index)"
        >
          <CIcon name="cilX" />
        </CButton>
      </CListGroupItem>
    </CListGroup>
  </div>
</template>

<script>
import { makeRandomString } from '@/helpers/random'

export default {
  name: 'MyArrayNoWrapper',
  mixins: [require('./input-mixin').default],
  inject: ['apiService'],
  props: {
    allowsEmpty: {
      type: Boolean,
      default: false
    },
    distinct: {
      type: Boolean,
      default: true
    },
    itemsSorter: {
      type: [Function, Boolean],
      default: (item1, item2) => {
        if (item1 < item2) {
          return -1
        } else if (item1 > item2) {
          return 1
        } else {
          return 0
        }
      }
    }
  },
  data () {
    return {
      innerForm: null
    }
  },
  computed: {
    innerField () {
      return `${this.field}_inner`
    }
  },
  mounted () {
    this.innerForm = this.apiService.makeForm({ [this.innerField]: null })
  },
  methods: {
    getListKey (item) {
      return `${item}_${makeRandomString()}`
    },
    addItem () {
      const newItem = this.innerForm.values[this.innerField]
      if (!this.allowsEmpty && !newItem) {
        return
      }
      if (this.distinct && this.value.includes(newItem)) {
        return
      }
      const newValue = [...this.value, newItem]
      if (this.itemsSorter) {
        newValue.sort(this.itemsSorter)
      }
      this.setValue(newValue)
      this.innerForm.reset()
    },
    deleteItem (indexToDelete) {
      this.setValue(this.value.filter((element, index) => index !== indexToDelete))
    }
  }
}
</script>
