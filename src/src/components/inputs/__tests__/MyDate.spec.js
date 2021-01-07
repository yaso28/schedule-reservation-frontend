import { mount } from '@vue/test-utils'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import MyDate from '../MyDate'
import myFormMocker from '@/testUtils/myFormMocker'

jest.mock('@/models/MyForm')

function getInputWrapper (wrapper) {
  return wrapper.find('input')
}
function getButtonWrapper (wrapper) {
  return wrapper.find('button')
}

describe('MyDate', () => {
  let form
  let field
  let wrapper
  beforeEach(() => {
    const label = 'サンプル'
    field = 'sample_field'
    form = myFormMocker.createMockSingleField(field, '')

    const mountOption = mountOptionCreator.create()
    mountOption.propsData = { label, form, field }
    wrapper = mount(MyDate, mountOption)
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
    const newValue = '2020-09-22'
    beforeEach(async () => {
      const inputWrapper = getInputWrapper(wrapper)
      await inputWrapper.setValue(newValue)
    })

    test('MyForm.setValue()を呼出', () => {
      expect(form.setValue).toHaveBeenCalledWith(field, newValue)
    })
  })

  describe('クリアボタンクリック', () => {
    beforeEach(async () => {
      const buttonWrapper = getButtonWrapper(wrapper)
      await buttonWrapper.trigger('click')
    })

    test('MyForm.setValue()を呼出', () => {
      expect(form.setValue).toHaveBeenCalledWith(field, '')
    })
  })

  describe('オプション', () => {
    describe('showClear=false', () => {
      beforeEach(() => {
        wrapper.setProps({ showClear: false })
      })

      test('クリアボタン非表示', () => {
        expect(wrapper.element).toMatchSnapshot()
      })
    })
  })
})
