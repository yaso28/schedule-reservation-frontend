import promiseMocker from '../promiseMocker'

let mainResult
const mainProc = async procList => {
  try {
    mainResult = await Promise.all(procList)
  } catch (e) {
    mainResult = e
  }
}

const expectedValue = 99
const expectedError = new Error('simple')
const arg1d1 = 1
const args1 = [arg1d1]
const arg2d1 = 2
const arg2d2 = 3
const args2 = [arg2d1, arg2d2]
const args3 = []
const caseList = [
  { args: args1, value: 111, error: new Error('111') },
  { args: args2, value: 222, error: new Error('222') },
  { args: args3, value: null, error: new Error('333') }
]
const caseEach = caseList.map((caseObj, index) => [`case${index + 1}`, caseObj])
const callMainForCases = proc => mainProc([proc(arg1d1), proc(arg2d1, arg2d2), proc()])

describe('promiseMocker', () => {
  let switchObj
  beforeEach(() => {
    promiseMocker.init()
    switchObj = promiseMocker.createSwitch()
    for (let i = 0; i < caseList.length; i++) {
      caseList[i].switch = promiseMocker.createSwitch()
    }
  })

  afterEach(() => {
    promiseMocker.clear()
    jest.resetAllMocks()
  })

  describe('mock()', () => {
    let proc
    beforeEach(() => {
      proc = promiseMocker.mock(expectedValue, expectedError, switchObj)
      mainProc([proc(arg1d1)])
    })

    test('呼出', () => {
      expect(proc).toHaveBeenCalledWith(arg1d1)
    })

    describe('エラー', () => {
      beforeEach(() => {
        promiseMocker.setSwitch(switchObj, false)
        promiseMocker.flushPendings()
      })

      test('エラー投げる', () => {
        expect(mainResult).toBe(expectedError)
      })
    })

    describe('成功', () => {
      beforeEach(() => {
        promiseMocker.flushPendings()
      })

      test('値を取得', () => {
        expect(mainResult).toEqual([expectedValue])
      })
    })
  })

  describe('mockResolved()', () => {
    let proc
    beforeEach(() => {
      proc = promiseMocker.mockResolved(expectedValue)
      mainProc([proc(arg1d1)])
    })

    test('呼出', () => {
      expect(proc).toHaveBeenCalledWith(arg1d1)
    })

    describe('成功', () => {
      beforeEach(() => {
        promiseMocker.flushPendings()
      })

      test('値を取得', () => {
        expect(mainResult).toEqual([expectedValue])
      })
    })
  })

  describe('mockRejected()', () => {
    let proc
    beforeEach(() => {
      proc = promiseMocker.mockRejected(expectedError)
      mainProc([proc(arg1d1)])
    })

    test('呼出', () => {
      expect(proc).toHaveBeenCalledWith(arg1d1)
    })

    describe('エラー', () => {
      beforeEach(() => {
        promiseMocker.flushPendings()
      })

      test('エラー投げる', () => {
        expect(mainResult).toBe(expectedError)
      })
    })
  })

  describe('mockForCases()', () => {
    let proc
    beforeEach(() => {
      proc = promiseMocker.mockForCases(caseList)
      callMainForCases(proc)
    })

    test.each(caseEach)('呼出：%s', (caseName, caseObj) => {
      expect(proc).toHaveBeenCalledWith(...caseObj.args)
    })

    test('呼出：回数', () => {
      expect(proc).toHaveBeenCalledTimes(caseList.length)
    })

    describe.each(caseEach)('%s：エラー', (caseName, caseObj) => {
      beforeEach(() => {
        promiseMocker.setSwitch(caseObj.switch, false)
        promiseMocker.flushPendings()
      })

      test('エラー投げる', () => {
        expect(mainResult).toBe(caseObj.error)
      })
    })

    describe('成功', () => {
      beforeEach(() => {
        promiseMocker.flushPendings()
      })

      test('値を取得', () => {
        expect(mainResult).toEqual(caseList.map(caseObj => caseObj.value))
      })
    })
  })

  describe('mockResolvedForCases()', () => {
    let proc
    beforeEach(() => {
      proc = promiseMocker.mockResolvedForCases(caseList)
      callMainForCases(proc)
    })

    test.each(caseEach)('呼出：%s', (caseName, caseObj) => {
      expect(proc).toHaveBeenCalledWith(...caseObj.args)
    })

    test('呼出：回数', () => {
      expect(proc).toHaveBeenCalledTimes(caseList.length)
    })

    describe('成功', () => {
      beforeEach(() => {
        promiseMocker.flushPendings()
      })

      test('値を取得', () => {
        expect(mainResult).toEqual(caseList.map(caseObj => caseObj.value))
      })
    })
  })

  describe('mockRejectedForCases()', () => {
    let proc
    beforeEach(() => {
      proc = promiseMocker.mockRejectedForCases(caseList)
    })

    describe.each(caseEach)('%s', (caseName, caseObj) => {
      beforeEach(() => {
        mainProc([proc(...caseObj.args)])
      })

      test('呼出', () => {
        expect(proc).toHaveBeenCalledWith(...caseObj.args)
      })

      describe('エラー', () => {
        beforeEach(() => {
          promiseMocker.flushPendings()
        })

        test('エラー投げる', () => {
          expect(mainResult).toBe(caseObj.error)
        })
      })
    })

    describe('複数呼出', () => {
      beforeEach(() => {
        callMainForCases(proc)
      })

      test('呼出：回数', () => {
        expect(proc).toHaveBeenCalledTimes(caseList.length)
      })
    })
  })
})
