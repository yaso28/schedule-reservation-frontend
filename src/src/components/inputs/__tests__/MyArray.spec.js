import { mount } from '@vue/test-utils'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import MyArray from '../MyArray'
import myFormMocker from '@/testUtils/myFormMocker'

jest.mock('@/models/MyForm')

const label = 'サンプル'
const field = 'sample_field'
const innerField = `${field}_inner`
const makeFormArgs = { [innerField]: null }

const item1 = 'item1'
const item2 = 'item2'
const item3 = 'item3'
const customItemsSorter = (item1, item2) => {
  if (item1 < item2) {
    return 1
  } else if (item1 > item2) {
    return -1
  } else {
    return 0
  }
}

const resetFormMock = (form, innerForm) => {
  form.setValue.mockReset()
  innerForm.reset.mockReset()
}
const addItem = async (wrapper, form, innerForm, item, expectedValueToSet = null) => {
  resetFormMock(form, innerForm)
  myFormMocker.setValueNonProps(innerForm, innerField, item)
  await wrapper.find('button.btn-array-add').trigger('click')
  if (expectedValueToSet) {
    await myFormMocker.setValue(wrapper, form, field, expectedValueToSet)
  }
}
const deleteItem = async (wrapper, form, innerForm, index, expectedValueToSet = null) => {
  resetFormMock(form, innerForm)
  await wrapper.findAll('button.btn-array-delete').at(index).trigger('click')
  if (expectedValueToSet) {
    await myFormMocker.setValue(wrapper, form, field, expectedValueToSet)
  }
}
const assertItemsList = wrapper => {
  expect(wrapper.find('ul.my-array-items').element).toMatchSnapshot()
}

describe('MyArray', () => {
  let form
  let innerForm
  let mountOption
  let apiService
  let wrapper
  beforeEach(() => {
    form = myFormMocker.createMockSingleField(field, [])
    innerForm = myFormMocker.createMock(makeFormArgs)

    mountOption = mountOptionCreator.create()
    mountOption.propsData = { label, form, field }
    mountOption.scopedSlots = {
      default: '<div>slot default. inner field = {{ props.innerField }}</div>'
    }

    apiService = mountOption.provide.apiService
    apiService.makeForm = jest.fn().mockReturnValueOnce(innerForm)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('通常', () => {
    beforeEach(() => {
      wrapper = mount(MyArray, mountOption)
    })

    test('内部フォーム作成', () => {
      expect(apiService.makeForm).toHaveBeenCalledWith(makeFormArgs)
    })

    test('表示', () => {
      expect(wrapper.element).toMatchSnapshot()
    })

    describe('バリデーションエラー', () => {
      beforeEach(async () => {
        await myFormMocker.setError(wrapper, form, field, 'エラーです')
      })

      test('表示', () => {
        expect(wrapper.element).toMatchSnapshot()
      })
    })

    describe('空を入力して追加ボタンクリック', () => {
      beforeEach(async () => {
        await addItem(wrapper, form, innerForm, '')
      })

      test('form.setValue()は呼び出さない', () => {
        expect(form.setValue).not.toHaveBeenCalled()
      })

      test('innerForm.reset()は呼び出さない', () => {
        expect(innerForm.reset).not.toHaveBeenCalled()
      })
    })

    describe('値を入力して追加ボタンクリック', () => {
      let expectedValueToSet
      beforeEach(async () => {
        expectedValueToSet = [item1]
        await addItem(wrapper, form, innerForm, item1, expectedValueToSet)
      })

      test('form.setValue()を呼出', () => {
        expect(form.setValue).toHaveBeenCalledWith(field, expectedValueToSet)
      })

      test('innerForm.reset()を呼出', () => {
        expect(innerForm.reset).toHaveBeenCalledWith()
      })

      describe('同じ値を入力して追加ボタンクリック', () => {
        beforeEach(async () => {
          await addItem(wrapper, form, innerForm, item1)
        })

        test('form.setValue()は呼び出さない', () => {
          expect(form.setValue).not.toHaveBeenCalled()
        })

        test('innerForm.reset()は呼び出さない', () => {
          expect(innerForm.reset).not.toHaveBeenCalled()
        })
      })

      describe('異なる値を入力して追加ボタンクリック', () => {
        beforeEach(async () => {
          expectedValueToSet = [item1, item3]
          await addItem(wrapper, form, innerForm, item3, expectedValueToSet)
        })

        test('form.setValue()を呼出', () => {
          expect(form.setValue).toHaveBeenCalledWith(field, expectedValueToSet)
        })

        test('innerForm.reset()を呼出', () => {
          expect(innerForm.reset).toHaveBeenCalledWith()
        })

        describe('中間の値を入力して追加ボタンクリック', () => {
          beforeEach(async () => {
            expectedValueToSet = [item1, item2, item3]
            await addItem(wrapper, form, innerForm, item2, expectedValueToSet)
          })

          test('form.setValue()を呼出', () => {
            expect(form.setValue).toHaveBeenCalledWith(field, expectedValueToSet)
          })

          test('innerForm.reset()を呼出', () => {
            expect(innerForm.reset).toHaveBeenCalledWith()
          })

          test('リスト表示', () => {
            assertItemsList(wrapper)
          })

          describe.each([
            [0, [item2, item3]],
            [1, [item1, item3]],
            [2, [item1, item2]]
          ])('削除ボタンクリック（index：%i）', (btnIndex, expectedValue) => {
            beforeEach(async () => {
              await deleteItem(wrapper, form, innerForm, btnIndex, expectedValue)
            })

            test('form.setValue()を呼出', () => {
              expect(form.setValue).toHaveBeenCalledWith(field, expectedValue)
            })

            test('innerForm.reset()は呼び出さない', () => {
              expect(innerForm.reset).not.toHaveBeenCalled()
            })
          })
        })
      })
    })
  })

  describe('初期値：あり', () => {
    beforeEach(() => {
      myFormMocker.setValueNonProps(form, field, [item1, item2])
      wrapper = mount(MyArray, mountOption)
    })

    test('リスト表示', () => {
      assertItemsList(wrapper)
    })

    describe('値を入力して追加ボタンクリック', () => {
      let expectedValueToSet
      beforeEach(async () => {
        expectedValueToSet = [item1, item2, item3]
        await addItem(wrapper, form, innerForm, item3, expectedValueToSet)
      })

      test('form.setValue()を呼出', () => {
        expect(form.setValue).toHaveBeenCalledWith(field, expectedValueToSet)
      })
    })
  })

  describe('slot', () => {
    describe('listItem', () => {
      beforeEach(() => {
        mountOption.scopedSlots.listItem = '<span class="slot-customized">{{ props.item }}</span>'
        wrapper = mount(MyArray, mountOption)
      })

      describe('値をセット', () => {
        beforeEach(async () => {
          await myFormMocker.setValue(wrapper, form, field, [item2])
        })

        test('リスト表示', () => {
          assertItemsList(wrapper)
        })
      })
    })
  })

  describe('オプション', () => {
    describe('allowsEmpty=true', () => {
      beforeEach(() => {
        mountOption.propsData.allowsEmpty = true
        wrapper = mount(MyArray, mountOption)
      })

      describe('空を入力して追加ボタンクリック', () => {
        let expectedValueToSet
        beforeEach(async () => {
          expectedValueToSet = ['']
          await addItem(wrapper, form, innerForm, '', expectedValueToSet)
        })

        test('form.setValue()を呼出', () => {
          expect(form.setValue).toHaveBeenCalledWith(field, expectedValueToSet)
        })

        test('innerForm.reset()を呼出', () => {
          expect(innerForm.reset).toHaveBeenCalledWith()
        })
      })
    })

    describe('distinct=false', () => {
      beforeEach(() => {
        mountOption.propsData.distinct = false
        wrapper = mount(MyArray, mountOption)
      })

      describe('同じ値を入力して追加ボタンクリック', () => {
        let expectedValueToSet
        beforeEach(async () => {
          expectedValueToSet = [item1, item1]
          await addItem(wrapper, form, innerForm, item1, [item1])
          await addItem(wrapper, form, innerForm, item1, expectedValueToSet)
        })

        test('form.setValue()を呼出', () => {
          expect(form.setValue).toHaveBeenCalledWith(field, expectedValueToSet)
        })

        test('innerForm.reset()を呼出', () => {
          expect(innerForm.reset).toHaveBeenCalledWith()
        })
      })
    })

    describe.each([
      ['custom', customItemsSorter, [item3, item1], [item3, item2, item1]],
      ['false', false, [item1, item3], [item1, item3, item2]]
    ])('itemsSorter=%s', (testCase, optionValue, expectedValueFirst, expectedValueSecond) => {
      beforeEach(() => {
        mountOption.propsData.itemsSorter = optionValue
        wrapper = mount(MyArray, mountOption)
      })

      describe('値を入力して追加ボタンクリック（2回）', () => {
        beforeEach(async () => {
          await addItem(wrapper, form, innerForm, item1, [item1])
          await addItem(wrapper, form, innerForm, item3, expectedValueFirst)
        })

        test('form.setValue()を呼出', () => {
          expect(form.setValue).toHaveBeenCalledWith(field, expectedValueFirst)
        })

        describe('値を入力して追加ボタンクリック（さらに1回）', () => {
          beforeEach(async () => {
            await addItem(wrapper, form, innerForm, item2, expectedValueSecond)
          })

          test('form.setValue()を呼出', () => {
            expect(form.setValue).toHaveBeenCalledWith(field, expectedValueSecond)
          })
        })
      })
    })
  })
})
