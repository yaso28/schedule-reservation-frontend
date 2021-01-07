import List from '../List'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'
import permission from '@/consts/permission'

jest.mock('@/store/modules')

const loadResult = require('@/testUtils/dummyApiData/reservation-organization/list.json')
const route = { name: 'reservation.reservation-organization.list' }

describe('List', () => {
  let mountOption
  let apiService
  beforeEach(() => {
    promiseMocker.init()
    mountOption = mountOptionCreator.create(storeModules)
    apiService = mountOption.provide.apiService
  })

  afterEach(() => {
    promiseMocker.clear()
    jest.resetAllMocks()
  })

  describe('write権限：あり', () => {
    beforeEach(() => {
      storeModules.auth.getters.can.mockReturnValue({ [permission.reservation.write]: true })
    })

    describe('マウント', () => {
      let wrapper
      let loadSwitch
      let loadError
      beforeEach(async () => {
        loadSwitch = promiseMocker.createSwitch()
        loadError = new Error('load')
        apiService.getReservationOrganizationList = promiseMocker.mock(loadResult, loadError, loadSwitch)
        wrapper = await pageTester.mount(List, route, mountOption)
      })

      test('titleタグ', () => {
        pageTester.assertTitleTag()
      })

      test('metaタグ', () => {
        pageTester.assertMetaTags()
      })

      test('ページ全体表示', () => {
        expect(wrapper.element).toMatchSnapshot()
      })

      test('Processingカバー表示開始', () => {
        expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
      })

      test('データ取得処理を呼出', () => {
        expect(apiService.getReservationOrganizationList).toHaveBeenCalledWith()
      })

      test('Processingカバー表示中', () => {
        expect(
          storeModules.processing.mutations.endGet
        ).not.toHaveBeenCalled()
      })

      describe('データ取得：エラー', () => {
        beforeEach(() => {
          promiseMocker.setSwitch(loadSwitch, false)
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
          promiseMocker.setSwitch(loadSwitch, true)
          promiseMocker.flushPendings()
        })

        test('テーブル表示', () => {
          expect(wrapper.find('table').element).toMatchSnapshot()
        })

        test('Processingカバー表示終了', () => {
          expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
        })
      })
    })
  })

  describe('write権限：なし', () => {
    let wrapper
    beforeEach(async () => {
      storeModules.auth.getters.can.mockReturnValue({})
      apiService.getReservationOrganizationList = promiseMocker.mockResolved(loadResult)
      wrapper = await pageTester.mount(List, route, mountOption)
      promiseMocker.flushPendings()
    })

    test('テーブル表示', () => {
      expect(wrapper.find('table').element).toMatchSnapshot()
    })

    test('フッター非表示', () => {
      expect(wrapper.find('footer.card-footer').exists()).toBeFalsy()
    })
  })
})
