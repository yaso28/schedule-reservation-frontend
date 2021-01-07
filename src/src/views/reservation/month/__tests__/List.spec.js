import List from '../List'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'
import permission from '@/consts/permission'

jest.mock('@/store/modules')

const loadResult = require('@/testUtils/dummyApiData/month/list.json')
const route = { name: 'reservation.month.list' }
const mockToday = { year: 2020, month: 11, day: 18 }
const olderYm = { year: 2020, month: 10 }
const newerYm = { year: 2021, month: 1 }

async function search (wrapper, year, month) {
  await wrapper.find('#search-year').setValue(year)
  await wrapper.find('#search-month').setValue(month)
  await wrapper.find('form').trigger('submit')
}
function getSearchResultWrapper (wrapper) {
  return wrapper.find('tbody')
}

describe('List', () => {
  let mountOption
  let apiService
  let dateService
  beforeEach(() => {
    promiseMocker.init()
    mountOption = mountOptionCreator.create(storeModules)
    apiService = mountOption.provide.apiService
    dateService = mountOption.provide.dateService
    dateService.today = jest.fn().mockReturnValue(new Date(`${mockToday.year}-${mockToday.month}-${mockToday.day}`))
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
      let loadError
      let loadSwitch
      beforeEach(async () => {
        loadError = new Error('load')
        loadSwitch = promiseMocker.createSwitch()
        apiService.getMonthList = promiseMocker.mock(loadResult, loadError, loadSwitch)
        wrapper = await pageTester.mount(List, route, mountOption)
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
        expect(apiService.getMonthList).toHaveBeenCalledWith(mockToday.year, mockToday.month)
      })

      test('Processingカバー表示中', () => {
        expect(storeModules.processing.mutations.endGet).not.toHaveBeenCalled()
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

        test('ページ全体表示', () => {
          expect(wrapper.element).toMatchSnapshot()
        })

        test('Processingカバー表示終了', () => {
          expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
        })

        describe('古い年月を指定して検索', () => {
          beforeEach(async () => {
            storeModules.processing.mutations.beginGet.mockReset()
            storeModules.processing.mutations.endGet.mockReset()
            apiService.getMonthList = promiseMocker.mock(loadResult, loadError, loadSwitch)
            await search(wrapper, olderYm.year, olderYm.month)
          })

          test('Processingカバー表示開始', () => {
            expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
          })

          test('データ取得処理を呼出', () => {
            expect(apiService.getMonthList).toHaveBeenCalledWith(olderYm.year, olderYm.month)
          })

          test('Processingカバー表示中', () => {
            expect(storeModules.processing.mutations.endGet).not.toHaveBeenCalled()
          })
        })

        describe('新しい年月を指定して検索', () => {
          beforeEach(async () => {
            storeModules.processing.mutations.beginGet.mockReset()
            storeModules.processing.mutations.endGet.mockReset()
            apiService.getMonthList = promiseMocker.mock(loadResult, loadError, loadSwitch)
            await search(wrapper, newerYm.year, newerYm.month)
          })

          test('Processingカバーは表示されない', () => {
            expect(storeModules.processing.mutations.beginGet).not.toHaveBeenCalled()
          })

          test('データ取得処理は呼び出さない', () => {
            expect(apiService.getMonthList).not.toHaveBeenCalled()
          })

          test('検索結果表示', () => {
            expect(getSearchResultWrapper(wrapper).element).toMatchSnapshot()
          })
        })
      })
    })
  })

  describe('write権限：なし', () => {
    let wrapper
    beforeEach(async () => {
      storeModules.auth.getters.can.mockReturnValue({})
      apiService.getMonthList = promiseMocker.mockResolved(loadResult)
      wrapper = await pageTester.mount(List, route, mountOption)
      promiseMocker.flushPendings()
    })

    test('検索結果表示', () => {
      expect(getSearchResultWrapper(wrapper).element).toMatchSnapshot()
    })
  })
})
