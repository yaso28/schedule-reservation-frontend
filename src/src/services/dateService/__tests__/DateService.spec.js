import DateService from '../DateService'
import dayOfWeek from '@/consts/dayOfWeek'

describe('DateService', () => {
  let dateService
  beforeEach(() => {
    dateService = new DateService()
  })

  describe('today()', () => {
    let actual
    let expected
    beforeEach(() => {
      actual = dateService.today()
      expected = new Date()
    })

    test('年が等しい', () => {
      expect(dateService.year(actual)).toBe(dateService.year(expected))
    })

    test('月が等しい', () => {
      expect(dateService.month(actual)).toBe(dateService.month(expected))
    })

    test('日が等しい', () => {
      expect(dateService.day(actual)).toBe(dateService.day(expected))
    })
  })

  describe('year()', () => {
    let actual
    let expected
    beforeEach(() => {
      actual = dateService.year(dateService.create('2020-08-04'))
      expected = 2020
    })

    test('結果が正しい', () => {
      expect(actual).toBe(expected)
    })
  })

  describe('month()', () => {
    let actual
    let expected
    beforeEach(() => {
      actual = dateService.month(dateService.create('2020-08-04'))
      expected = 8
    })

    test('結果が正しい', () => {
      expect(actual).toBe(expected)
    })
  })

  describe('day()', () => {
    let actual
    let expected
    beforeEach(() => {
      actual = dateService.day(dateService.create('2020-08-04'))
      expected = 4
    })

    test('結果が正しい', () => {
      expect(actual).toBe(expected)
    })
  })

  describe('dayOfWeekIndex()', () => {
    describe.each([
      ['monday', '2020-11-16', dayOfWeek.monday],
      ['tuesday', '2020-11-17', dayOfWeek.tuesday],
      ['wednesday', '2020-11-18', dayOfWeek.wednesday],
      ['thursday', '2020-11-19', dayOfWeek.thursday],
      ['friday', '2020-11-20', dayOfWeek.friday],
      ['saturday', '2020-11-21', dayOfWeek.saturday],
      ['sunday', '2020-11-22', dayOfWeek.sunday]
    ])('%s', (dayOfWeekName, dateValue, expected) => {
      let actual
      beforeEach(() => {
        actual = dateService.dayOfWeekIndex(dateService.create(dateValue))
      })

      test('結果が正しい', () => {
        expect(actual).toBe(expected)
      })
    })
  })
})
