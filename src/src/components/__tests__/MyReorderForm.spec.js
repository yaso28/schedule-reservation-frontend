import MyReorderForm from '../MyReorderForm'
import { mount } from '@vue/test-utils'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import myFormMocker from '@/testUtils/myFormMocker'

jest.mock('@/models/MyForm')

function getListWrapper (wrapper) {
  return wrapper.find('transition-group-stub')
}

describe('MyReorderForm', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('通常', () => {
    let wrapper
    let items
    let apiService
    beforeEach(() => {
      items = [
        { id: 1, name: 'あああ' },
        { id: 2, name: 'いいいいいいいいい' },
        { id: 3, name: 'ううううう' }
      ]
      const mountOption = mountOptionCreator.create()
      mountOption.propsData = { items }
      apiService = mountOption.provide.apiService
      wrapper = mount(MyReorderForm, mountOption)
    })

    test('全体表示', () => {
      expect(wrapper.element).toMatchSnapshot()
    })

    describe('itemsプロパティ変更', () => {
      beforeEach(() => {
        const otherItems = [
          { id: 6, name: 'かかかか' },
          { id: 3, name: 'きき' },
          { id: 5, name: 'くくくくくくく' }
        ]
        wrapper.setProps({ items: otherItems })
      })

      test('リスト表示', () => {
        expect(getListWrapper(wrapper).element).toMatchSnapshot()
      })
    })

    describe('上ボタンクリック', () => {
      beforeEach(async () => {
        await wrapper.find(`button#btn-up-${items[1].id}`).trigger('click')
      })

      test('リスト表示', () => {
        expect(getListWrapper(wrapper).element).toMatchSnapshot()
      })
    })

    describe('上ボタンクリック（先頭）', () => {
      beforeEach(async () => {
        await wrapper.find(`button#btn-up-${items[0].id}`).trigger('click')
      })

      test('リスト表示', () => {
        expect(getListWrapper(wrapper).element).toMatchSnapshot()
      })
    })

    describe('下ボタンクリック', () => {
      beforeEach(async () => {
        await wrapper.find(`button#btn-down-${items[1].id}`).trigger('click')
      })

      test('リスト表示', () => {
        expect(getListWrapper(wrapper).element).toMatchSnapshot()
      })
    })

    describe('下ボタンクリック（末尾）', () => {
      beforeEach(async () => {
        await wrapper.find(`button#btn-down-${items[items.length - 1].id}`).trigger('click')
      })

      test('リスト表示', () => {
        expect(getListWrapper(wrapper).element).toMatchSnapshot()
      })
    })

    describe('リセットボタンクリック', () => {
      beforeEach(async () => {
        await wrapper.find(`button#btn-up-${items[1].id}`).trigger('click')
        await wrapper.find(`button#btn-down-${items[0].id}`).trigger('click')
        await wrapper.find('button#btn-reset').trigger('click')
      })

      test('リスト表示', () => {
        expect(getListWrapper(wrapper).element).toMatchSnapshot()
      })
    })

    describe('フォーム送信', () => {
      let makeFormArgs
      let form
      beforeEach(async () => {
        await wrapper.find(`button#btn-up-${items[1].id}`).trigger('click')
        await wrapper.find(`button#btn-down-${items[0].id}`).trigger('click')
        makeFormArgs = { id_list: [items[1].id, items[2].id, items[0].id] }
        form = myFormMocker.createMock(makeFormArgs)
        apiService.makeForm = jest.fn().mockReturnValueOnce(form)
        await wrapper.find('form').trigger('submit')
      })

      test('フォーム作成', () => {
        expect(apiService.makeForm).toHaveBeenCalledWith(makeFormArgs)
      })

      test('フォーム送信イベント投げる', () => {
        expect(wrapper.emitted('submit')[0]).toEqual([form])
      })
    })
  })

  describe('mapper指定あり', () => {
    let wrapper
    beforeEach(() => {
      const items = [
        { value: 1, label: 'あああ' },
        { value: 2, label: 'いいいいいいいいい' },
        { value: 3, label: 'ううううう' }
      ]
      const valueMapper = i => i.value
      const labelMapper = i => i.label
      const mountOption = mountOptionCreator.create()
      mountOption.propsData = { items, valueMapper, labelMapper }
      wrapper = mount(MyReorderForm, mountOption)
    })

    test('リスト表示', () => {
      expect(getListWrapper(wrapper).element).toMatchSnapshot()
    })
  })
})
