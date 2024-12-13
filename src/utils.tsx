type zoomLevel = {
    key: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'shmita' | 'decade',
    label: string,
    visibleTicks: number,
    unit: 'minute' | 'hour' | 'day' | 'month' | 'year'
    incrementFunc: (firstTick: Date, i: number) => number
  }
  
  export const addMinutes = (date: Date, minutes: number) => date.getTime() + minutes * 60 * 1000
  
  export const addHours = (date: Date, hours: number) => date.getTime() + hours * 60 * 60 * 1000
  
  export const addDays = (date: Date, days: number) => date.getTime() + days * 24 * 60 * 60 * 1000
  
  export const addMonths = (date: Date, months: number) => {
    const newDate = new Date(date)
    newDate.setMonth(date.getMonth() + months)
    return newDate.getTime()
  }
  
  export const addYears = (date: Date, years: number) => {
    const newDate = new Date(date)
    newDate.setFullYear(date.getFullYear() + years)
    return newDate.getTime()
  }
  
  export const ZOOM: Record<number, zoomLevel> = {
    0: {
      key: 'hour',
      label: 'Hour',
      visibleTicks: 61,
      unit: 'minute',
      incrementFunc: addMinutes
    },
    1: {
      key: 'day',
      label: 'Day',
      visibleTicks: 25,
      unit: 'hour',
      incrementFunc: addHours
    },
    2: {
      key: 'week',
      label: 'Week',
      visibleTicks: 8,
      unit: 'day',
      incrementFunc: addDays
    },
    3: {
      key: 'month',
      label: 'Month',
      visibleTicks: 32,
      unit: 'day',
      incrementFunc: addDays
    },
    4: {
      key: 'quarter',
      label: 'Quarter',
      visibleTicks: 4,
      unit: 'month',
      incrementFunc: addMonths
  
    },
    5: {
      key: 'year',
      label: 'Year',
      visibleTicks: 13,
      unit: 'month',
      incrementFunc: addMonths
    },
    6: {
      key: 'shmita',
      label: 'Shmita Cycle',
      visibleTicks: 8,
      unit: 'year',
      incrementFunc: addYears
    },
    7: {
      key: 'decade',
      label: 'Decade',
      visibleTicks: 11,
      unit: 'year',
      incrementFunc: addYears
    }
  }
  
  export const zoomMax = Math.max(...Object.keys(ZOOM).map(Number))
  
  export const zoomMin = Math.min(...Object.keys(ZOOM).map(Number))
  