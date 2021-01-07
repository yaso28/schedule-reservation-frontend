import { mount } from '@vue/test-utils'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import MySelect from '../MySelect'
import myFormMocker from '@/testUtils/myFormMocker'

jest.mock('@/models/MyForm')

function getOptionWrapperArray (wrapper) {
  return wrapper.find('select').findAll('option')
}

const options = [
  { id: 1, name: 'オプション1' },
  { id: 2, name: 'オプション2' },
  { id: 3, name: 'オプション3' }
]
const selectIndex = 1
const valueAfterSelect = 1

describe('MySelect', () => {
  let form
  let field
  let wrapper
  beforeEach(() => {
    const label = 'サンプル'
    field = 'sample_field'
    form = myFormMocker.createMockSingleField(field, null)

    const mountOption = mountOptionCreator.create()
    mountOption.propsData = { label, form, field, options }
    wrapper = mount(MySelect, mountOption)
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
    let optionWrapperArray
    beforeEach(() => {
      optionWrapperArray = getOptionWrapperArray(wrapper)
    })

    describe('有効な値を選択', () => {
      beforeEach(async () => {
        await optionWrapperArray.at(selectIndex).setSelected()
      })

      test('MyForm.setValue()を呼出', () => {
        expect(form.setValue).toHaveBeenCalledWith(field, valueAfterSelect)
      })
    })

    describe('空を選択', () => {
      beforeEach(async () => {
        await myFormMocker.setValue(wrapper, form, field, 2)
        await optionWrapperArray.at(0).setSelected()
      })

      test('MyForm.setValue()を呼出', () => {
        expect(form.setValue).toHaveBeenCalledWith(field, null)
      })
    })
  })

  describe('オプション', () => {
    describe('custom mappers', () => {
      beforeEach(() => {
        const customOptions = [
          { key: 2, value: 'カスタム２' },
          { key: 4, value: 'カスタム４' }
        ]
        wrapper.setProps({
          options: customOptions,
          valueMapper: o => o.key,
          labelMapper: o => o.value
        })
      })

      test('表示', () => {
        expect(wrapper.element).toMatchSnapshot()
      })
    })
  })
})
