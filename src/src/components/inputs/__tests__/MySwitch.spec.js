import { mount } from '@vue/test-utils'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import MySwitch from '../MySwitch'
import myFormMocker from '@/testUtils/myFormMocker'

jest.mock('@/models/MyForm')

function getInputWrapper (wrapper) {
  return wrapper.find('input')
}

describe('MySwitch', () => {
  let form
  let field
  let wrapper
  beforeEach(() => {
    const label = 'サンプル'
    field = 'sample_field'
    form = myFormMocker.createMockSingleField(field, false)

    const mountOption = mountOptionCreator.create()
    mountOption.propsData = { label, form, field }
    wrapper = mount(MySwitch, mountOption)
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
    let inputWrapper
    beforeEach(() => {
      inputWrapper = getInputWrapper(wrapper)
    })

    describe('チェックON', () => {
      beforeEach(async () => {
        await myFormMocker.setValue(wrapper, form, field, false)
        await inputWrapper.setChecked(true)
      })

      test('MyForm.setValue()を呼出', () => {
        expect(form.setValue).toHaveBeenCalledWith(field, true)
      })
    })

    describe('チェックOFF', () => {
      beforeEach(async () => {
        await myFormMocker.setValue(wrapper, form, field, true)
        await inputWrapper.setChecked(false)
      })

      test('MyForm.setValue()を呼出', () => {
        expect(form.setValue).toHaveBeenCalledWith(field, false)
      })
    })
  })
})
