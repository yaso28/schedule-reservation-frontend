import MyForm from '../MyForm'
import axiosInstance from '@/services/axiosInstance'
import apiResponseMocker from '@/testUtils/apiResponseMocker'
import promiseMocker from '@/testUtils/promiseMocker'

jest.mock('@/services/axiosInstance')

const inputOld = {
  text_1: null,
  text_2: 'テキスト２',
  text_3: 'テキスト３',
  number_1: null,
  number_2: 24,
  bool_1: false,
  array_1: [],
  array_2: [1, 4],
  nested_1: [
    { id: 1, name: 'ネスト1', price: 200 },
    { id: 2, name: 'ネスト2', price: 150 }
  ],
  nested_2: [
    { id: 11, name: null, price: null },
    { id: 22, name: null, price: null }
  ]
}
const inputNew = {
  text_1: '新しいテキスト１です',
  text_2: '新しいテキスト２です',
  text_3: null,
  number_1: -3,
  number_2: null,
  bool_1: true,
  array_1: [3, 5],
  array_2: [],
  nested_1: [
    { id: 1, name: '新しいネスト1', price: 300 },
    { id: 2, name: '新しいネスト2', price: 400 }
  ],
  nested_2: [
    { id: 11, name: null, price: null },
    { id: 22, name: '新しいネスト22', price: -30 }
  ]
}
const inputNewModified = {
  text_1: '新しいテキスト１です',
  text_2: '新しいテキスト２です',
  text_3: '新しいテキスト３です',
  number_1: 3,
  number_2: null,
  bool_1: true,
  array_1: [3, 5, 11],
  array_2: [2],
  nested_1: [
    { id: 1, name: '新しいネスト1', price: 300 },
    { id: 2, name: '新しいネスト2', price: 400 }
  ],
  nested_2: [
    { id: 11, name: '新しいネスト11', price: -1 },
    { id: 22, name: '新しいネスト22', price: 30 }
  ]
}
const fields = Object.keys(inputOld)
const nestedFields = ['nested_1', 'nested_2']

const dummyApiData = true
const dummyApiResponse = apiResponseMocker.mockSuccess(dummyApiData)
const dummyInvalidErrors = {
  text_3: ['必須項目です'],
  number_1: ['正の整数を入力してください'],
  array_2: ['どれか選択してください'],
  'nested_2.0.name': ['必須項目です'],
  'nested_2.0.price': ['必須項目です'],
  'nested_2.1.price': ['正の整数を入力してください']
}
const dummyInvalidErrorsAgain = {
  text_3: ['5文字以内にしてください'],
  array_1: ['選択は2つ以内にしてください'],
  'nested_2.0.price': ['正の整数を入力してください']
}

const setValue = function (form, input) {
  fields.forEach(field => {
    if (nestedFields.includes(field)) {
      const nestedValuesList = input[field]
      for (let i = 0; i < nestedValuesList.length; i++) {
        const nestedValues = nestedValuesList[i]
        Object.keys(nestedValues).forEach(nestedField => {
          form.setValue(`${field}.${i}.${nestedField}`, nestedValues[nestedField])
        })
      }
    } else {
      form.setValue(field, input[field])
    }
  })
}
const assertValues = function (form, input) {
  expect(form.values).toEqual(input)
}
const assertErrors = function (form, apiErrors) {
  const expected = {}
  Object.keys(apiErrors).forEach(key => {
    expected[key] = apiErrors[key][0]
  })
  expect(form.errors).toEqual(expected)
}

describe('MyForm', () => {
  beforeEach(() => {
    promiseMocker.init()
  })

  afterEach(() => {
    promiseMocker.clear()
    jest.resetAllMocks()
  })

  describe('init', () => {
    let form
    beforeEach(() => {
      form = new MyForm(inputOld, axiosInstance)
    })

    test('valuesに初期値をセット', () => {
      assertValues(form, inputOld)
    })

    test('errorsなし', () => {
      assertErrors(form, {})
    })

    describe('setValue()', () => {
      beforeEach(() => {
        setValue(form, inputNew)
      })

      test('valuesに値をセット', () => {
        assertValues(form, inputNew)
      })

      describe('reset()', () => {
        beforeEach(() => {
          form.reset()
        })

        test('valuesが初期値に戻っている', () => {
          assertValues(form, inputOld)
        })
      })

      describe('setInit()', () => {
        beforeEach(() => {
          form.setInit()
          setValue(form, inputNewModified)
          form.reset()
        })

        test('valuesの初期値が更新されている', () => {
          assertValues(form, inputNew)
        })
      })

      describe('post()', () => {
        const url = '/api/sample'
        let firstSwitch
        let firstError
        let firstPromise
        beforeEach(() => {
          firstSwitch = promiseMocker.createSwitch()
          firstError = new Error('first')
          firstError.response = apiResponseMocker.mockInvalid(
            dummyInvalidErrors
          )
          axiosInstance.post = promiseMocker.mock(
            dummyApiResponse,
            firstError,
            firstSwitch
          )
          firstPromise = form.post(url)
        })

        test('新しい値をAPIに送信', () => {
          expect(axiosInstance.post).toHaveBeenCalledWith(url, inputNew)
        })

        describe('API：成功', () => {
          let result
          beforeEach(async () => {
            promiseMocker.setSwitch(firstSwitch, true)
            promiseMocker.flushPendings()
            result = await firstPromise
          })

          test('結果を取得', () => {
            expect(result).toBe(dummyApiData)
          })

          test('valuesはそのまま', () => {
            assertValues(form, inputNew)
          })

          test('errorsなし', () => {
            assertErrors(form, {})
          })
        })

        describe('API：エラー', () => {
          let result
          beforeEach(async () => {
            promiseMocker.setSwitch(firstSwitch, false)
            try {
              promiseMocker.flushPendings()
              await firstPromise
            } catch (e) {
              result = e
            }
          })

          test('エラー投げる', () => {
            expect(result).toBe(firstError)
          })

          test('valuesはそのまま', () => {
            assertValues(form, inputNew)
          })

          test('errorsにセット', () => {
            assertErrors(form, dummyInvalidErrors)
          })

          describe('reset()', () => {
            beforeEach(() => {
              form.reset()
            })

            test('valuesが初期値に戻っている', () => {
              assertValues(form, inputOld)
            })

            test('errorsクリア', () => {
              assertErrors(form, {})
            })
          })

          describe('再びsetValue()', () => {
            beforeEach(() => {
              setValue(form, inputNewModified)
            })

            test('valuesに値をセット', () => {
              assertValues(form, inputNewModified)
            })

            test('errorsはそのまま', () => {
              assertErrors(form, dummyInvalidErrors)
            })

            describe('再びpost()', () => {
              let secondSwitch
              let secondError
              let secondPromise
              beforeEach(() => {
                secondSwitch = promiseMocker.createSwitch()
                secondError = new Error('second')
                secondError.response = apiResponseMocker.mockInvalid(
                  dummyInvalidErrorsAgain
                )
                axiosInstance.post = promiseMocker.mock(
                  dummyApiResponse,
                  secondError,
                  secondSwitch
                )
                secondPromise = form.post(url)
              })

              test('再入力した値をAPIに送信', () => {
                expect(axiosInstance.post).toHaveBeenCalledWith(url, inputNewModified)
              })

              describe('API：成功', () => {
                let result
                beforeEach(async () => {
                  promiseMocker.setSwitch(secondSwitch, true)
                  promiseMocker.flushPendings()
                  result = await secondPromise
                })

                test('結果を取得', () => {
                  expect(result).toBe(dummyApiData)
                })

                test('valuesはそのまま', () => {
                  assertValues(form, inputNewModified)
                })

                test('errorsなし', () => {
                  assertErrors(form, {})
                })
              })

              describe('API：エラー', () => {
                let result
                beforeEach(async () => {
                  promiseMocker.setSwitch(secondSwitch, false)
                  try {
                    promiseMocker.flushPendings()
                    await secondPromise
                  } catch (e) {
                    result = e
                  }
                })

                test('エラー投げる', () => {
                  expect(result).toBe(secondError)
                })

                test('valuesはそのまま', () => {
                  assertValues(form, inputNewModified)
                })

                test('errorsにセット', () => {
                  assertErrors(form, dummyInvalidErrorsAgain)
                })
              })
            })
          })
        })
      })
    })
  })
})
