const SECOND_IN_MS = 1000
const MINUTE_IN_MS = 60 * SECOND_IN_MS
const HOUR_IN_MS = 60 * MINUTE_IN_MS
const DAY_IN_MS = 24 * HOUR_IN_MS

const getDayOne = (birthDate: Date) => new Date(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate())
const getMsSinceDay1 = (date: Date, birthDate: Date) => date.getTime() - getDayOne(birthDate).getTime()
export const dayNumber = (date: Date, birthDate: Date) => Math.ceil((getMsSinceDay1(date, birthDate) + 1) / DAY_IN_MS)
export const birthdayBasedWeekNumber = (date: Date, birthDate: Date) => Math.ceil((getMsSinceDay1(date, birthDate) + 1) / (7 * DAY_IN_MS))
export const sundayBasedWeekNumber = (date: Date, birthDate: Date) => Math.ceil((getMsSinceDay1(date, birthDate) + getDayOne(birthDate).getDay() * DAY_IN_MS + 1) / (7 * DAY_IN_MS))

const MINUTE: Intl.DateTimeFormatOptions = { minute: '2-digit' }
const HOUR: Intl.DateTimeFormatOptions = { hour: 'numeric', hour12: true }
const DAY: Intl.DateTimeFormatOptions = { day: 'numeric' }
const WEEKDAY: Intl.DateTimeFormatOptions = { weekday: 'short' }
const MONTH: Intl.DateTimeFormatOptions = { month: 'short' }
const YEAR: Intl.DateTimeFormatOptions = { year: 'numeric' }
export const FULL_DATE_FORMAT = {...YEAR, ...MONTH, ...WEEKDAY, ...DAY, ...HOUR, ...MINUTE}

export const getNow = () => {
  return new Date()
}
