import MockDate from 'mockdate'

// For Vite, we use import.meta.env instead of process.env
const PAUSED_TIME = import.meta.env.VITE_PAUSED_TIME

if (PAUSED_TIME) {
  MockDate.set(PAUSED_TIME)
}

export const STARTING_ZOOM = 1 
export const LOCALE: Intl.LocalesArgument = 'en-US'
export const PAN_AMOUNT = 1 // 1 time unit
