import { mount } from '@vue/test-utils'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import MyText from '../MyText'
import myFormMocker from '@/testUtils/myFormMocker'

jest.mock('@/models/MyForm')

function getInputWrapper (wrapper) {
  return wrapper.find('input')
}

describe('AdditionalCommonOptions', () => {
  let label
  let form
  let field
  let mountOption
  let wrapper
  beforeEach(() => {
    label = 'サンプル'
    mountOption = mountOptionCreator.create()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('IdPrefix', () => {
    beforeEach(() => {
      field = 'sample'
      form = myFormMocker.createMockSingleField(field, '')
      mountOption.propsData = { label, form, field, idPrefix: 'prefix' }
      wrapper = mount(MyText, mountOption)
    })

    test('表示', () => {
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  describe('Nested', () => {
    beforeEach(() => {
      field = 'sample.1.sample_field'
      form = myFormMocker.createMockSingleField('sample', [
        { sample_field: '' },
        { sample_field: '' }
      ])
      mountOption.propsData = { label, form, field }
      wrapper = mount(MyText, mountOption)
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
      const newValue = 'あいう'
      beforeEach(async () => {
        const inputWrapper = getInputWrapper(wrapper)
        await inputWrapper.setValue(newValue)
      })

      test('MyForm.setValue()を呼出', () => {
        expect(form.setValue).toHaveBeenCalledWith(field, newValue)
      })
    })
  })
})
