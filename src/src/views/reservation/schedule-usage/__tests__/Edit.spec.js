import Edit from '../Edit'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'
import myFormMocker from '@/testUtils/myFormMocker'

jest.mock('@/store/modules')
jest.mock('@/models/MyForm')

const reservationOrganizations = require('@/testUtils/dummyApiData/reservation-organization/list.json')
const record = require('@/testUtils/dummyApiData/schedule-usage/get.json')
const id = record.id
const makeFormArgs = {
  name: record.name,
  is_public: record.is_public,
  reservation_organization_id: record.reservation_organization_id
}
const saveResult = require('@/testUtils/dummyApiData/common/update.json')
saveResult.id = id

function getFormWrapper (wrapper) {
  return wrapper.find('form')
}

describe('Edit', () => {
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
    let loadReservationOrganizationsSwitch
    let loadReservationOrganizationsError
    let loadSwitch
    let loadError
    beforeEach(async () => {
      loadReservationOrganizationsSwitch = promiseMocker.createSwitch()
      loadReservationOrganizationsError = new Error('reservation organizations')
      apiService.getReservationOrganizationList = promiseMocker.mock(
        reservationOrganizations,
        loadReservationOrganizationsError,
        loadReservationOrganizationsSwitch
      )
      loadSwitch = promiseMocker.createSwitch()
      loadError = new Error('load record')
      apiService.getScheduleUsage = promiseMocker.mock(
        record,
        loadError,
        loadSwitch
      )
      wrapper = await pageTester.mount(Edit, { name: 'reservation.schedule-usage.edit', params: { id } }, mountOption)
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

    test('予約団体マスタ取得処理を呼出', () => {
      expect(apiService.getReservationOrganizationList).toHaveBeenCalledWith()
    })

    test('レコード取得処理を呼出', () => {
      expect(apiService.getScheduleUsage).toHaveBeenCalledWith(id)
    })

    test('Processingカバー表示中', () => {
      expect(
        storeModules.processing.mutations.endGet
      ).not.toHaveBeenCalled()
    })

    describe('予約団体マスタ取得：エラー', () => {
      beforeEach(() => {
        promiseMocker.setSwitch(loadReservationOrganizationsSwitch, false)
        promiseMocker.setSwitch(loadSwitch, true)
        apiService.isHandledError = jest.fn().mockReturnValueOnce(true)
        promiseMocker.flushPendings()
      })

      test('エラー処理', () => {
        expect(apiService.isHandledError).toHaveBeenCalledWith(loadReservationOrganizationsError)
      })

      test('Processingカバー表示終了', () => {
        expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
      })
    })

    describe('レコード取得：エラー', () => {
      beforeEach(() => {
        promiseMocker.setSwitch(loadReservationOrganizationsSwitch, true)
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
      let form
      beforeEach(() => {
        promiseMocker.setSwitch(loadReservationOrganizationsSwitch, true)
        promiseMocker.setSwitch(loadSwitch, true)
        form = myFormMocker.createMock(makeFormArgs)
        apiService.makeForm = jest.fn().mockReturnValueOnce(form)
        promiseMocker.flushPendings()
      })

      test('フォーム作成', () => {
        expect(apiService.makeForm).toHaveBeenCalledWith(makeFormArgs)
      })

      test('ページ全体表示', () => {
        expect(wrapper.element).toMatchSnapshot()
      })

      test('Processingカバー表示終了', () => {
        expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
      })

      describe('URL変更', () => {
        let newId
        beforeEach(() => {
          newId = id + 1
          apiService.getReservationOrganizationList = promiseMocker.mock(
            reservationOrganizations,
            loadReservationOrganizationsError,
            loadReservationOrganizationsSwitch
          )
          apiService.getScheduleUsage = promiseMocker.mock(
            record,
            loadError,
            loadSwitch
          )
          storeModules.processing.mutations.beginGet.mockReset()
          storeModules.processing.mutations.endGet.mockReset()
          wrapper.setProps({ id: newId })
        })

        test('Processingカバー表示開始', () => {
          expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
        })

        test('予約団体マスタ取得処理は呼び出さない', () => {
          expect(apiService.getReservationOrganizationList).not.toHaveBeenCalled()
        })

        test('レコード取得処理を呼出', () => {
          expect(apiService.getScheduleUsage).toHaveBeenCalledWith(newId)
        })

        test('Processingカバー表示中', () => {
          expect(
            storeModules.processing.mutations.endGet
          ).not.toHaveBeenCalled()
        })
      })

      describe('リセットボタンクリック', () => {
        beforeEach(() => {
          wrapper.find('#btn-reset').trigger('click')
        })

        test('フォームリセット', () => {
          expect(form.reset).toHaveBeenCalledWith()
        })
      })

      describe('フォーム送信', () => {
        let saveSwitch
        let saveError
        beforeEach(() => {
          saveSwitch = promiseMocker.createSwitch()
          saveError = new Error('save')
          apiService.updateScheduleUsage = promiseMocker.mock(
            saveResult,
            saveError,
            saveSwitch
          )
          getFormWrapper(wrapper).trigger('submit')
        })

        test('Processingカバー表示開始', () => {
          expect(storeModules.processing.mutations.beginPost).toHaveBeenCalled()
        })

        test('アラートクリア', () => {
          expect(storeModules.alert.mutations.clear).toHaveBeenCalled()
        })

        test('保存処理を呼出', () => {
          expect(apiService.updateScheduleUsage).toHaveBeenCalledWith(id, form)
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
            expect(router.push).toHaveBeenCalledWith({ name: 'reservation.schedule-usage.list' })
          })

          test('Processingカバー表示終了', () => {
            expect(storeModules.processing.mutations.endPost).toHaveBeenCalled()
          })
        })
      })
    })
  })
})
