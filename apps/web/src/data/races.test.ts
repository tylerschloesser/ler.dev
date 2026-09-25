import { describe, expect, it } from 'vitest'
import { LOCATIONS, RACES, type LocationId } from './races.ts'

describe('RACES', () => {
  it('has 13 marathon finishes, 1 half and 4 DNFs', () => {
    expect(RACES).toHaveLength(18)
    const finished = RACES.filter((r) => r.outcome.status === 'finished')
    expect(finished.filter((r) => r.distance === 'marathon')).toHaveLength(13)
    expect(RACES.filter((r) => r.distance === 'half-marathon')).toHaveLength(1)
    expect(RACES.filter((r) => r.outcome.status === 'dnf')).toHaveLength(4)
  })

  it('is sorted oldest first', () => {
    const dates = RACES.map((r) => r.date)
    expect(dates).toEqual([...dates].sort())
  })

  it('has unique date-prefixed ids', () => {
    const ids = RACES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const race of RACES) {
      expect(race.id).toMatch(/^\d{4}-\d{2}-\d{2}-/)
      expect(race.id.startsWith(race.date)).toBe(true)
    }
  })

  it('uses every location, and only known ones', () => {
    const used = new Set(RACES.map((r) => r.locationId))
    for (const race of RACES) expect(LOCATIONS[race.locationId]).toBeDefined()
    expect([...used].sort()).toEqual((Object.keys(LOCATIONS) as LocationId[]).sort())
  })

  it('has finish times formatted h:mm:ss', () => {
    for (const race of RACES) {
      if (race.outcome.status === 'finished') expect(race.outcome.time).toMatch(/^\d:\d{2}:\d{2}$/)
    }
  })
})

describe('LOCATIONS', () => {
  it('are inside the continental US', () => {
    for (const { lat, lng } of Object.values(LOCATIONS)) {
      expect(lat).toBeGreaterThan(24)
      expect(lat).toBeLessThan(50)
      expect(lng).toBeGreaterThan(-125)
      expect(lng).toBeLessThan(-66)
    }
  })
})
