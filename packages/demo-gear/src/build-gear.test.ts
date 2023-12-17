import { describe, expect, test } from '@jest/globals'
import { getBuildHand } from './build-gear.js'
import { SimpleVec2, World } from './types.js'

describe('build-gear', () => {
  describe('getBuildHand', () => {
    test('base', () => {
      const world: World = {
        entities: {},
        networks: {},
        tiles: {},
        version: 1,
      }
      const center: SimpleVec2 = {
        x: 0,
        y: 0,
      }
      const radius = 1
      const chainFrom = null
      const hand = getBuildHand(
        world,
        center,
        radius,
        chainFrom,
      )
      expect(hand).toMatchSnapshot()
    })
  })
})
