import { LOCATIONS, type Race } from '../data/races.ts'

const dateFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})
const numberFormat = new Intl.NumberFormat('en-US')

export const formatDate = (date: string) => dateFormat.format(new Date(`${date}T00:00:00Z`))

export const formatNumber = (n: number) => numberFormat.format(n)

export const formatPlace = (location: Race['locationId']) => {
  const { city, region } = LOCATIONS[location]
  return `${city}, ${region}`
}
