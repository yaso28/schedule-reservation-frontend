import MyForm from '@/models/MyForm'
jest.mock('@/models/MyForm')

class MyFormMocker {
  createMockSingleField (field, initValue) {
    const input = {}
    input[field] = initValue
    return this.createMock(input)
  }

  createMock (input) {
    const mockForm = new MyForm(input)
    mockForm.values = input
    mockForm.errors = {}
    return mockForm
  }

  async setValue (wrapper, form, field, value) {
    await wrapper.setProps({
      form: Object.assign({}, form, {
        values: Object.assign({}, form.values, { [field]: value })
      })
    })
  }

  setValueNonProps (form, field, value) {
    form.values[field] = value
  }

  async setError (wrapper, form, field, errorMessage) {
    await wrapper.setProps({
      form: Object.assign({}, form, {
        errors: Object.assign({}, form.errors, { [field]: errorMessage })
      })
    })
  }
}

export default new MyFormMocker()
