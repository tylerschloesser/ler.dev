import { describe, expect, it } from 'vitest'
import { LOCATIONS, RACES, type LocationId } from './races.ts'

type ActivityFile = {
  summary: { source: string; activityId: string; start: string; elapsedS: number; partial?: true }
}

const activityFiles = import.meta.glob<ActivityFile>('./activities/*.json', { eager: true, import: 'default' })

const toSeconds = (time: string) => time.split(':').reduce((acc, part) => acc * 60 + Number(part), 0)

describe('RACES', () => {
  it('has 21 marathon finishes, 1 half and 4 DNFs', () => {
    expect(RACES).toHaveLength(26)
    const finished = RACES.filter((r) => r.outcome.status === 'finished')
    expect(finished.filter((r) => r.distance === 'marathon')).toHaveLength(21)
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

  it('has finish, gun and split times formatted h:mm:ss', () => {
    for (const { outcome } of RACES) {
      if (outcome.status !== 'finished') continue
      const times = [outcome.time, outcome.gunTime, ...(outcome.splits ?? []).map((s) => s.time)]
      for (const time of times) if (time !== undefined) expect(time).toMatch(/^\d:\d{2}:\d{2}$/)
    }
  })

  it('has increasing splits that end before the finish', () => {
    for (const { outcome } of RACES) {
      if (outcome.status !== 'finished' || !outcome.splits) continue
      const seconds = [...outcome.splits.map((s) => toSeconds(s.time)), toSeconds(outcome.time)]
      expect(seconds).toEqual([...seconds].sort((a, b) => a - b))
    }
  })

  it('has places within their field sizes', () => {
    for (const { outcome } of RACES) {
      if (outcome.status !== 'finished') continue
      const pairs = [
        [outcome.rank, outcome.participants],
        [outcome.genderRank, outcome.genderParticipants],
        [outcome.divisionRank, outcome.divisionParticipants],
      ]
      for (const [rank, of] of pairs) if (rank !== undefined && of !== undefined) expect(rank).toBeLessThanOrEqual(of)
    }
  })
})

describe('activities', () => {
  const withActivity = RACES.filter((r) => r.activity)

  it('has a data file for every race activity, and no orphans', () => {
    expect(Object.keys(activityFiles).sort()).toEqual(withActivity.map((r) => `./activities/${r.id}.json`).sort())
  })

  it.each(withActivity.map((r) => [r.id, r] as const))('%s matches its data file', (_, race) => {
    const { summary } = activityFiles[`./activities/${race.id}.json`]
    expect(summary.source).toBe(race.activity?.source)
    expect(summary.activityId).toBe(race.activity?.id)
    expect(summary.start.slice(0, 10)).toBe(race.date)
    expect(summary.partial).toBe(race.activity?.partial)
    // Elapsed watch time should be within 5% of the official chip time, unless the recording is partial.
    if (race.outcome.status === 'finished' && !summary.partial) {
      const chip = toSeconds(race.outcome.time)
      expect(Math.abs(summary.elapsedS - chip) / chip).toBeLessThan(0.05)
    }
  })
})

describe('LOCATIONS', () => {
  it('have valid coordinates', () => {
    for (const { lat, lng } of Object.values(LOCATIONS)) {
      expect(Math.abs(lat)).toBeLessThanOrEqual(90)
      expect(Math.abs(lng)).toBeLessThanOrEqual(180)
    }
  })

  it('name a country only outside the US', () => {
    for (const location of Object.values(LOCATIONS) as { region: string; country?: string }[]) {
      if (location.country === undefined) expect(location.region).toMatch(/^[A-Z]{2}$/)
    }
  })
})
