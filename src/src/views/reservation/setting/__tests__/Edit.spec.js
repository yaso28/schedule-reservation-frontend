
import Edit from '../Edit'
import mountOptionCreator from '@/testUtils/mountOptionCreator'
import pageTester from '@/testUtils/pageTester'
import promiseMocker from '@/testUtils/promiseMocker'
import storeModules from '@/store/modules'
import myFormMocker from '@/testUtils/myFormMocker'
import caseMocker from '@/testUtils/caseMocker'
import setting from '@/consts/setting'

jest.mock('@/store/modules')
jest.mock('@/models/MyForm')

const makeSettingRecord = (categoryName, keyName, value, description) => ({ category_name: categoryName, key_name: keyName, value, description })
const makeEditTarget = (name, expectedRecord) => ({ name, expectedRecord, makeFormArgs: { value: expectedRecord.value } })
const editTargetList = [
  /*
  makeEditTarget(
    '宛先メールアドレス',
    makeSettingRecord(setting.reservation.category, setting.reservation.mail_to, 'sample@example.com', '練習予定を送信する宛先のメールアドレスです。')
  ),
  */
  makeEditTarget(
    '件名',
    makeSettingRecord(setting.reservation.category, setting.reservation.mail_subject, '{month_name}の練習予定', 'メールの件名です。{month_name}は"yyyy年mm月"に置き換わります。')
  ),
  makeEditTarget(
    '本文（開始）',
    makeSettingRecord(setting.reservation.category, setting.reservation.mail_message_begin, 'こんにちは。\n{month_name}の練習予定をご連絡します。', 'メール本文の最初に載せる文章です。{month_name}は"yyyy年mm月"に置き換わります。この文章のあとに予定が載ります。')
  ),
  makeEditTarget(
    '本文（終了）',
    makeSettingRecord(setting.reservation.category, setting.reservation.mail_message_end, '以上です。\nよろしくお願いします。', 'メール本文の最後に載せる文章です。')
  ),
  makeEditTarget(
    '注意事項',
    makeSettingRecord(setting.reservation_public.category, setting.reservation_public.notes, '〇〇にご注意ください。\n××にご注意ください。', 'メール本文の途中（予定のあと）に載せる注意事項の文章です。また、公開している練習予定ページの注意事項にも同じ文章が載ります。')
  )
]
const editTargetEach = editTargetList.map(target => [target.name, target])
const addToEditTargetList = addProc => {
  for (let i = 0; i < editTargetList.length; i++) {
    addProc(editTargetList[i])
  }
}

describe('Edit', () => {
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

  describe('マウント', () => {
    let wrapper
    beforeEach(async () => {
      addToEditTargetList(target => {
        target.loadCase = {
          args: [target.expectedRecord.category_name, target.expectedRecord.key_name],
          value: target.expectedRecord,
          error: new Error(`load:${target.name}`),
          switch: promiseMocker.createSwitch()
        }
      })
      apiService.getSetting = promiseMocker.mockForCases(editTargetList.map(target => target.loadCase))
      wrapper = await pageTester.mount(Edit, { name: 'reservation.setting.edit' }, mountOption)
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

    test.each(editTargetEach)('レコード取得処理呼出：%s', (name, target) => {
      expect(apiService.getSetting).toHaveBeenCalledWith(target.expectedRecord.category_name, target.expectedRecord.key_name)
    })

    test('レコード取得処理呼出：回数', () => {
      expect(apiService.getSetting).toHaveBeenCalledTimes(editTargetList.length)
    })

    test('Processingカバー表示中', () => {
      expect(storeModules.processing.mutations.endGet).not.toHaveBeenCalled()
    })

    describe.each(editTargetEach)('レコード取得：エラー：%s', (name, target) => {
      beforeEach(() => {
        promiseMocker.setSwitch(target.loadCase.switch, false)
        apiService.isHandledError = jest.fn().mockReturnValueOnce(true)
        promiseMocker.flushPendings()
      })

      test('エラー処理', () => {
        expect(apiService.isHandledError).toHaveBeenCalledWith(target.loadCase.error)
      })

      test('Processingカバー表示終了', () => {
        expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
      })
    })

    describe('レコード取得：成功', () => {
      beforeEach(() => {
        addToEditTargetList(target => {
          target.form = myFormMocker.createMock(target.makeFormArgs)
        })
        apiService.makeForm = caseMocker.mock(editTargetList.map(target => ({ args: [target.makeFormArgs], value: target.form })))
        promiseMocker.flushPendings()
      })

      test.each(editTargetEach)('フォーム作成：%s', (name, target) => {
        expect(apiService.makeForm).toHaveBeenCalledWith(target.makeFormArgs)
      })

      test('フォーム作成：回数', () => {
        expect(apiService.makeForm).toHaveBeenCalledTimes(editTargetList.length)
      })

      test('ページ全体表示', () => {
        expect(wrapper.element).toMatchSnapshot()
      })

      test('Processingカバー表示終了', () => {
        expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
      })

      describe('リセットボタンクリック', () => {
        beforeEach(() => {
          wrapper.find('button.btn-reset').trigger('click')
        })

        test.each(editTargetEach)('フォームリセット：%s', (name, target) => {
          expect(target.form.reset).toHaveBeenCalledWith()
        })
      })

      describe('フォーム送信', () => {
        beforeEach(() => {
          addToEditTargetList(target => {
            target.saveCase = {
              args: [target.expectedRecord.category_name, target.expectedRecord.key_name, target.form],
              value: null,
              error: new Error(`save:${target.name}`),
              switch: promiseMocker.createSwitch()
            }
          })
          apiService.updateSetting = promiseMocker.mockForCases(editTargetList.map(target => target.saveCase))
          wrapper.find('form').trigger('submit')
        })

        test('Processingカバー表示開始', () => {
          expect(storeModules.processing.mutations.beginPost).toHaveBeenCalled()
        })

        test('アラートクリア', () => {
          expect(storeModules.alert.mutations.clear).toHaveBeenCalled()
        })

        test.each(editTargetEach)('保存処理呼出：%s', (name, target) => {
          expect(apiService.updateSetting).toHaveBeenCalledWith(target.expectedRecord.category_name, target.expectedRecord.key_name, target.form)
        })

        test('保存処理呼出：回数', () => {
          expect(apiService.updateSetting).toHaveBeenCalledTimes(editTargetList.length)
        })

        test('Processingカバー表示中', () => {
          expect(storeModules.processing.mutations.endPost).not.toHaveBeenCalled()
        })

        describe.each(editTargetEach)('保存：エラー：%s', (name, target) => {
          beforeEach(() => {
            promiseMocker.setSwitch(target.saveCase.switch, false)
            apiService.isHandledError = jest.fn().mockReturnValueOnce(true)
            promiseMocker.flushPendings()
          })

          test('エラー処理', () => {
            expect(apiService.isHandledError).toHaveBeenCalledWith(target.saveCase.error)
          })

          test('Processingカバー表示終了', () => {
            expect(storeModules.processing.mutations.endGet).toHaveBeenCalled()
          })

          test('成功アラートは表示しない', () => {
            expect(storeModules.alert.actions.saveSuccessNoRedirect).not.toHaveBeenCalled()
          })

          test.each(editTargetEach)('フォーム初期値更新は呼び出さない：%s', (name, target) => {
            expect(target.form.setInit).not.toHaveBeenCalled()
          })
        })

        describe('保存：成功', () => {
          beforeEach(() => {
            promiseMocker.flushPendings()
          })

          test('成功アラート表示', () => {
            expect(storeModules.alert.actions.saveSuccessNoRedirect).toHaveBeenCalled()
          })

          test.each(editTargetEach)('フォーム初期値更新：%s', (name, target) => {
            expect(target.form.setInit).toHaveBeenCalledWith()
          })

          test('Processingカバー表示終了', () => {
            expect(storeModules.processing.mutations.endPost).toHaveBeenCalled()
          })
        })
      })
    })
  })
})
