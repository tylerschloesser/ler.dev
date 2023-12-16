import { describe, expect, test } from '@jest/globals'
import { isHorizontal } from './util.js'

describe('util', () => {
  describe('isHorizontal', () => {
    test('rotation=0 is true', () => {
      expect(isHorizontal(0)).toBe(true)
    })
  })
})
