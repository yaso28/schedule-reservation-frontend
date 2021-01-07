import { mount } from '@vue/test-utils'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import MyCheckboxes from '../MyCheckboxes'
import myFormMocker from '@/testUtils/myFormMocker'

jest.mock('@/models/MyForm')

function getInputWrapperArray (wrapper) {
  return wrapper.findAll('input')
}

const options = [
  { id: 1, name: 'オプション1' },
  { id: 2, name: 'オプション2' },
  { id: 3, name: 'オプション3' }
]
const valueBeforeCheckOn = []
const checkOnIndex = 1
const valueAfterCheckOn = [2]
const valueBeforeCheckOff = [1, 2, 3]
const checkOffIndex = 2
const valueAfterCheckOff = [1, 2]

describe('MyCheckboxes', () => {
  let form
  let field
  let mountOption
  let wrapper
  beforeEach(() => {
    const label = 'サンプル'
    field = 'sample_field'
    form = myFormMocker.createMockSingleField(field, [])

    mountOption = mountOptionCreator.create()
    mountOption.propsData = { label, form, field, options }
    wrapper = mount(MyCheckboxes, mountOption)
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
    let inputWrapperArray
    beforeEach(() => {
      inputWrapperArray = getInputWrapperArray(wrapper)
    })

    describe('チェックON', () => {
      beforeEach(async () => {
        await myFormMocker.setValue(wrapper, form, field, valueBeforeCheckOn)
        await inputWrapperArray.at(checkOnIndex).setChecked(true)
      })

      test('MyForm.setValue()を呼出', () => {
        expect(form.setValue).toHaveBeenCalledWith(field, valueAfterCheckOn)
      })
    })

    describe('チェックOFF', () => {
      beforeEach(async () => {
        await myFormMocker.setValue(wrapper, form, field, valueBeforeCheckOff)
        await inputWrapperArray.at(checkOffIndex).setChecked(false)
      })

      test('MyForm.setValue()を呼出', () => {
        expect(form.setValue).toHaveBeenCalledWith(field, valueAfterCheckOff)
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

    describe('inline', () => {
      beforeEach(() => {
        wrapper.setProps({
          inline: true
        })
      })

      test('表示', () => {
        expect(wrapper.element).toMatchSnapshot()
      })
    })
  })

  describe('slot', () => {
    beforeEach(() => {
      mountOption.scopedSlots = {
        label (props) {
          return <span class="aaa">{props.option.name}</span>
        }
      }
      wrapper = mount(MyCheckboxes, mountOption)
    })

    test('表示', () => {
      expect(wrapper.element).toMatchSnapshot()
    })
  })
})
