import Form from 'form-backend-validation'

export default class MyForm {
  #formInstance
  #topLevelFields

  constructor (input, http) {
    this.#formInstance = new Form(input, {
      resetOnSuccess: false,
      http
    })
    this.#topLevelFields = Object.keys(input)
    this.values = {}
    this.loadInstanceValues()
  }

  loadInstanceValues () {
    this.#topLevelFields.forEach(field => {
      this.values[field] = this.#formInstance[field]
    })

    this.errors = {}
    Object.keys(this.#formInstance.errors.all()).forEach(errorKey => {
      this.errors[errorKey] = this.#formInstance.errors.first(errorKey)
    })
  }

  setValue (field, value) {
    const fieldSplit = field.split('.')
    const bottomLevel = fieldSplit.length - 1

    let setTargetForThis = this.values
    let setTargetForFormInstance = this.#formInstance
    for (let i = 0; i < bottomLevel; i++) {
      setTargetForThis = setTargetForThis[fieldSplit[i]]
      setTargetForFormInstance = setTargetForFormInstance[fieldSplit[i]]
    }
    setTargetForThis[fieldSplit[bottomLevel]] = value
    setTargetForFormInstance[fieldSplit[bottomLevel]] = value
  }

  reset () {
    this.#formInstance.reset()
    this.loadInstanceValues()
  }

  setInit () {
    this.#formInstance.setInitialValues(this.values)
  }

  async post (url) {
    console.log(`CALLED: MyForm.post(${url})`)

    try {
      const responseData = await this.#formInstance.post(url)
      return responseData?.data ?? null
    } finally {
      this.loadInstanceValues()
    }
  }
}
