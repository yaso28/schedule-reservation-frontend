export default {
  inheritAttrs: false,
  props: {
    label: {
      type: String,
      default: ''
    },
    form: {
      type: Object,
      required: true
    },
    field: {
      type: String,
      required: true
    },
    idPrefix: {
      type: String,
      default: ''
    }
  },
  computed: {
    value () {
      const fieldSplit = this.field.split('.')
      let result = this.form.values
      for (let i = 0; i < fieldSplit.length; i++) {
        result = result[fieldSplit[i]]
      }
      return result
    },
    isInvalid () {
      return !!this.invalidMessage
    },
    invalidMessage () {
      return this.form.errors[this.field]
    },
    id () {
      return [this.idPrefix, this.field].filter(str => str).join('-')
    }
  },
  methods: {
    setValue (newValue) {
      this.form.setValue(this.field, newValue)
    },
    validate () {
      if (this.isInvalid) {
        return false
      }
      return null
    }
  }
}
