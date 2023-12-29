import { describe, expect, test } from '@jest/globals'
import { initWorld } from './world-v2.js'

describe('world-v2', () => {
  describe('initWorld', () => {
    test('new world', () => {
      const actual = initWorld()
      expect(actual).toMatchSnapshot()
    })
  })
})
