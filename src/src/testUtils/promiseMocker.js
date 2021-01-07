import _ from 'lodash'

const createSetTimeoutPromise = getResult => new Promise((resolve, reject) => {
  setTimeout(() => getResult(resolve, reject), 1000)
})
const createSwitchPromise = (value, error, switchObj) => createSetTimeoutPromise(
  (resolve, reject) => switchObj.isSuccess ? resolve(value) : reject(error)
)
const createResolvedPromise = value => createSetTimeoutPromise(resolve => resolve(value))
const createRejectedPromise = error => createSetTimeoutPromise((resolve, reject) => reject(error))

const createMock = createPromise => jest.fn().mockImplementationOnce(createPromise)
const createMockForCases = (caseList, createPromiseForCurrentCase) => jest.fn((...args) => {
  for (let i = 0; i < caseList.length; i++) {
    const currentCase = caseList[i]
    if (_.isEqual(args, currentCase.args)) {
      return createPromiseForCurrentCase(currentCase)
    }
  }
  throw new Error('createMockForCases: no args matched')
})

class PromiseMocker {
  init () {
    jest.useFakeTimers()
  }

  clear () {
    jest.clearAllTimers()
  }

  flushPendings () {
    jest.runOnlyPendingTimers()
  }

  createSwitch () {
    return { isSuccess: true }
  }

  setSwitch (switchObj, isSuccess) {
    switchObj.isSuccess = isSuccess
  }

  mock (value, error, switchObj) {
    return createMock(() => createSwitchPromise(value, error, switchObj))
  }

  mockResolved (value) {
    return createMock(() => createResolvedPromise(value))
  }

  mockRejected (error) {
    return createMock(() => createRejectedPromise(error))
  }

  mockForCases (caseList) {
    return createMockForCases(caseList, currentCase => createSwitchPromise(currentCase.value, currentCase.error, currentCase.switch))
  }

  mockResolvedForCases (caseList) {
    return createMockForCases(caseList, currentCase => createResolvedPromise(currentCase.value))
  }

  mockRejectedForCases (caseList) {
    return createMockForCases(caseList, currentCase => createRejectedPromise(currentCase.error))
  }
}

export default new PromiseMocker()
