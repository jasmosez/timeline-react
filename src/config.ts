import MockDate from 'mockdate'

// For Vite, we use import.meta.env instead of process.env
const PAUSED_TIME = import.meta.env.VITE_PAUSED_TIME

if (PAUSED_TIME) {
  MockDate.set(PAUSED_TIME)
}

export const STARTING_ZOOM = 2 
export const LOCALE: Intl.LocalesArgument = 'en-US'
export const PAN_AMOUNT = 1 // 1 time unit

// James bday was 2:25am on 4/19/82, before daylight savings began
export const birthDate = new Date('1982-04-19T02:25:00-05:00')

// Set the transition duration for the timeline
document.documentElement.style.setProperty(
    '--timeline-transition-duration',
    `${import.meta.env.VITE_TRANSITION_DURATION || 1000}ms`
  ); 