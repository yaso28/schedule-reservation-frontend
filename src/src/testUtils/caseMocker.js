import _ from 'lodash'

class CaseMocker {
  mock (caseList) {
    return jest.fn((...args) => {
      for (let i = 0; i < caseList.length; i++) {
        const currentCase = caseList[i]
        if (_.isEqual(args, currentCase.args)) {
          return currentCase.value
        }
      }
      throw new Error('caseMocker.mock: no args matched')
    })
  }
}

export default new CaseMocker()
