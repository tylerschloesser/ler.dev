import { describe, expect, test } from '@jest/globals'
import { BeltDirection } from './types.js'
import { isHorizontal } from './util.js'

describe('util', () => {
  describe('isHorizontal', () => {
    const testCases: [BeltDirection, boolean][] = [
      [BeltDirection.enum.EastWest, true],
      [BeltDirection.enum.NorthSouth, false],
      [BeltDirection.enum.NorthEast, false],
      [BeltDirection.enum.NorthWest, false],
      [BeltDirection.enum.SouthEast, false],
      [BeltDirection.enum.SouthWest, false],
    ]

    for (const [direction, expected] of testCases) {
      test(`isHorizontal(${direction}) === ${expected}`, () => {
        expect(isHorizontal(direction)).toBe(expected)
      })
    }
  })
})
