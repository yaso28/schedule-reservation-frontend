import Reorder from '../Reorder'
import MyReorderForm from '@/components/MyReorderForm'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'
import myFormMocker from '@/testUtils/myFormMocker'

jest.mock('@/store/modules')
jest.mock('@/models/MyForm')

const records = require('@/testUtils/dummyApiData/schedule-place/list.json')

describe('Reorder', () => {
  let mountOption
  let apiService
  let router
  beforeEach(() => {
    promiseMocker.init()
    mountOption = mountOptionCreator.create(storeModules)
    apiService = mountOption.provide.apiService
    router = mountOption.router
  })

  afterEach(() => {
    promiseMocker.clear()
    jest.resetAllMocks()
  })

  describe('マウント', () => {
    let wrapper
    let loadSwtich
    let loadError
    beforeEach(async () => {
      loadSwtich = promiseMocker.createSwitch()
      loadError = new Error('load')
      apiService.getSchedulePlaceList = promiseMocker.mock(
        records,
        loadError,
        loadSwtich
      )
      wrapper = await pageTester.mount(Reorder, { name: 'reservation.schedule-place.reorder' }, mountOption)
    })

    test('titleタグ', () => {
      pageTester.assertTitleTag()
    })

    test('metaタグ', () => {
      pageTester.assertMetaTags()
    })

    test('Processingカバー表示開始', () => {
      expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
    })

    test('データ取得処理を呼出', () => {
      expect(apiService.getSchedulePlaceList).toHaveBeenCalledWith()
    })

    test('Processingカバー表示中', () => {
      expect(
        storeModules.processing.mutations.endGet
      ).not.toHaveBeenCalled()
    })

    describe('データ取得：エラー', () => {
      beforeEach(() => {
        promiseMocker.setSwitch(loadSwtich, false)
        apiService.isHandledError = jest.fn().mockReturnValueOnce(true)
        promiseMocker.flushPendings()
      })

      test('エラー処理', () => {
        expect(apiService.isHandledError).toHaveBeenCalledWith(loadError)
      })

      test('Processingカバー表示終了', () => {
        expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
      })
    })

    describe('データ取得：成功', () => {
      beforeEach(() => {
        promiseMocker.setSwitch(loadSwtich, true)
        promiseMocker.flushPendings()
      })

      test('ページ全体表示', () => {
        expect(wrapper.element).toMatchSnapshot()
      })

      test('Processingカバー表示終了', () => {
        expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
      })

      describe('フォーム送信', () => {
        let form
        let saveSwitch
        let saveError
        beforeEach(() => {
          form = myFormMocker.createMock({ id_list: [3, 1, 2] })
          saveSwitch = promiseMocker.createSwitch()
          saveError = new Error('save')
          apiService.reorderSchedulePlace = promiseMocker.mock(
            null,
            saveError,
            saveSwitch
          )
          wrapper.findComponent(MyReorderForm).vm.$emit('submit', form)
        })

        test('Processingカバー表示開始', () => {
          expect(storeModules.processing.mutations.beginPost).toHaveBeenCalled()
        })

        test('アラートクリア', () => {
          expect(storeModules.alert.mutations.clear).toHaveBeenCalled()
        })

        test('保存処理を呼出', () => {
          expect(apiService.reorderSchedulePlace).toHaveBeenCalledWith(form)
        })

        test('Processingカバー表示中', () => {
          expect(
            storeModules.processing.mutations.endPost
          ).not.toHaveBeenCalled()
        })

        describe('保存：エラー', () => {
          beforeEach(() => {
            promiseMocker.setSwitch(saveSwitch, false)
            apiService.isHandledError = jest.fn().mockReturnValueOnce(true)
            promiseMocker.flushPendings()
          })

          test('エラー処理', () => {
            expect(apiService.isHandledError).toHaveBeenCalledWith(saveError)
          })

          test('Processingカバー表示終了', () => {
            expect(storeModules.processing.mutations.endPost).toHaveBeenCalled()
          })
        })

        describe('保存：成功', () => {
          beforeEach(() => {
            promiseMocker.setSwitch(saveSwitch, true)
            router.push = jest.fn()
            promiseMocker.flushPendings()
          })

          test('アラート', () => {
            expect(storeModules.alert.actions.saveSuccess).toHaveBeenCalled()
          })

          test('リダイレクト', () => {
            expect(router.push).toHaveBeenCalledWith({ name: 'reservation.schedule-place.list' })
          })

          test('Processingカバー表示終了', () => {
            expect(storeModules.processing.mutations.endPost).toHaveBeenCalled()
          })
        })
      })
    })
  })
})
