export default class DateService {
  create (value) {
    return new Date(value)
  }

  today () {
    const result = new Date()
    result.setHours(0, 0, 0, 0)
    return result
  }

  year (date) {
    return date.getFullYear()
  }

  month (date) {
    return date.getMonth() + 1
  }

  day (date) {
    return date.getDate()
  }

  dayOfWeekIndex (date) {
    return date.getDay()
  }
}
