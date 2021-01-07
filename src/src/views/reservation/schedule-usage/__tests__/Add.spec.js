import Add from '../Add'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'
import myFormMocker from '@/testUtils/myFormMocker'

jest.mock('@/store/modules')
jest.mock('@/models/MyForm')

const reservationOrganizations = require('@/testUtils/dummyApiData/reservation-organization/list.json')
const originalRecord = require('@/testUtils/dummyApiData/schedule-usage/get.json')
const saveResult = require('@/testUtils/dummyApiData/common/add.json')

function setRouteCopyId (route, id) {
  route.query = { original_id: id }
}

describe('Add', () => {
  let mountOption
  let apiService
  let router
  let route
  beforeEach(() => {
    promiseMocker.init()
    mountOption = mountOptionCreator.create(storeModules)
    apiService = mountOption.provide.apiService
    router = mountOption.router
    route = { name: 'reservation.schedule-usage.add' }
  })

  afterEach(() => {
    promiseMocker.clear()
    jest.resetAllMocks()
  })

  describe('通常', () => {
    describe('マウント', () => {
      let wrapper
      let loadReservationOrganizationsSwitch
      let loadReservationOrganizationsError
      beforeEach(async () => {
        loadReservationOrganizationsSwitch = promiseMocker.createSwitch()
        loadReservationOrganizationsError = new Error('reservation organizations')
        apiService.getReservationOrganizationList = promiseMocker.mock(
          reservationOrganizations,
          loadReservationOrganizationsError,
          loadReservationOrganizationsSwitch
        )
        apiService.getScheduleUsage = jest.fn()
        wrapper = await pageTester.mount(Add, route, mountOption)
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

      test('コピー元データ取得処理は呼び出さない', () => {
        expect(apiService.getScheduleUsage).not.toHaveBeenCalled()
      })

      test('Processingカバー表示中', () => {
        expect(
          storeModules.processing.mutations.endGet
        ).not.toHaveBeenCalled()
      })

      describe('予約団体マスタ取得：エラー', () => {
        beforeEach(() => {
          promiseMocker.setSwitch(loadReservationOrganizationsSwitch, false)
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

      describe('データ取得：成功', () => {
        let makeFormArgs
        let form
        beforeEach(() => {
          promiseMocker.setSwitch(loadReservationOrganizationsSwitch, true)
          makeFormArgs = {
            name: '',
            is_public: true,
            reservation_organization_id: null
          }
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
            apiService.addScheduleUsage = promiseMocker.mock(
              saveResult,
              saveError,
              saveSwitch
            )
            wrapper.find('form').trigger('submit')
          })

          test('Processingカバー表示開始', () => {
            expect(storeModules.processing.mutations.beginPost).toHaveBeenCalled()
          })

          test('アラートクリア', () => {
            expect(storeModules.alert.mutations.clear).toHaveBeenCalled()
          })

          test('保存処理を呼出', () => {
            expect(apiService.addScheduleUsage).toHaveBeenCalledWith(form)
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

  describe('コピー', () => {
    let originalId
    beforeEach(() => {
      originalId = 1
      setRouteCopyId(route, originalId)
    })

    describe('マウント', () => {
      let loadSwitch
      let loadError
      let loadReservationOrganizationsSwitch
      let loadReservationOrganizationsError
      beforeEach(async () => {
        loadSwitch = promiseMocker.createSwitch()
        loadError = new Error('load')
        apiService.getScheduleUsage = promiseMocker.mock(
          originalRecord,
          loadError,
          loadSwitch
        )
        loadReservationOrganizationsSwitch = promiseMocker.createSwitch()
        loadReservationOrganizationsError = new Error('reservation organizations')
        apiService.getReservationOrganizationList = promiseMocker.mock(
          reservationOrganizations,
          loadReservationOrganizationsError,
          loadReservationOrganizationsSwitch
        )
        await pageTester.mount(Add, route, mountOption)
      })

      test('Processingカバー表示開始', () => {
        expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
      })

      test('予約団体マスタ取得処理を呼出', () => {
        expect(apiService.getReservationOrganizationList).toHaveBeenCalledWith()
      })

      test('コピー元データ取得処理を呼出', () => {
        expect(apiService.getScheduleUsage).toHaveBeenCalledWith(originalId)
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

      describe('コピー元データ取得処理：エラー', () => {
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
        let makeFormArgs
        let form
        beforeEach(() => {
          promiseMocker.setSwitch(loadReservationOrganizationsSwitch, true)
          promiseMocker.setSwitch(loadSwitch, true)
          makeFormArgs = {
            name: originalRecord.name,
            is_public: originalRecord.is_public,
            reservation_organization_id: originalRecord.reservation_organization_id
          }
          form = myFormMocker.createMock(makeFormArgs)
          apiService.makeForm = jest.fn().mockReturnValueOnce(form)
          promiseMocker.flushPendings()
        })

        test('フォーム作成', () => {
          expect(apiService.makeForm).toHaveBeenCalledWith(makeFormArgs)
        })

        test('Processingカバー表示終了', () => {
          expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
        })

        describe('URL変更', () => {
          let newOriginalId
          beforeEach(() => {
            newOriginalId = originalId + 1
            setRouteCopyId(route, newOriginalId)
            apiService.getScheduleUsage = promiseMocker.mock(
              originalRecord,
              loadError,
              loadSwitch
            )
            apiService.getReservationOrganizationList = promiseMocker.mock(
              reservationOrganizations,
              loadReservationOrganizationsError,
              loadReservationOrganizationsSwitch
            )
            storeModules.processing.mutations.beginGet.mockReset()
            storeModules.processing.mutations.endGet.mockReset()
            router.push(route)
          })

          test('Processingカバー表示開始', () => {
            expect(storeModules.processing.mutations.beginGet).toHaveBeenCalled()
          })

          test('予約団体マスタ取得処理は呼び出さない', () => {
            expect(apiService.getReservationOrganizationList).not.toHaveBeenCalled()
          })

          test('コピー元データ取得処理を呼出', () => {
            expect(apiService.getScheduleUsage).toHaveBeenCalledWith(newOriginalId)
          })

          test('Processingカバー表示中', () => {
            expect(
              storeModules.processing.mutations.endGet
            ).not.toHaveBeenCalled()
          })
        })
      })
    })
  })
})
