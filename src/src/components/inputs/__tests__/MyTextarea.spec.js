import { mount } from '@vue/test-utils'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import MyTextarea from '../MyTextarea'
import myFormMocker from '@/testUtils/myFormMocker'

jest.mock('@/models/MyForm')

function getInputWrapper (wrapper) {
  return wrapper.find('textarea')
}

describe('MyTextarea', () => {
  let form
  let field
  let wrapper
  beforeEach(() => {
    const label = 'サンプル'
    field = 'sample_field'
    form = myFormMocker.createMockSingleField(field, '')

    const mountOption = mountOptionCreator.create()
    mountOption.propsData = { label, form, field }
    wrapper = mount(MyTextarea, mountOption)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('通常', () => {
    test('表示', () => {
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  describe('バリデーションエラー', () => {
    beforeEach(async () => {
      await myFormMocker.setError(wrapper, form, field, 'エラーです')
    })

    test('表示', () => {
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  describe('入力', () => {
    const newValue = 'あいう\nえお'
    beforeEach(async () => {
      const inputWrapper = getInputWrapper(wrapper)
      await inputWrapper.setValue(newValue)
    })

    test('MyForm.setValue()を呼出', () => {
      expect(form.setValue).toHaveBeenCalledWith(field, newValue)
    })
  })

  describe('オプション', () => {
    describe('rows', () => {
      beforeEach(() => {
        wrapper.setProps({ rows: 10 })
      })

      test('rows属性変更', () => {
        expect(getInputWrapper(wrapper).attributes()).toMatchSnapshot()
      })
    })
  })
})
