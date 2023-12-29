import { describe, expect, test } from '@jest/globals'
import { Entity } from './types-entity.js'
import { initWorld, tryAddEntities } from './world-v2.js'

describe('world-v2', () => {
  describe('initWorld', () => {
    test('new world', () => {
      const actual = initWorld()
      expect(actual).toMatchSnapshot()
    })
  })

  describe('tryAddEntities', () => {
    test('todo', () => {
      const world = initWorld()
      const entities: Entity[] = []
      const actual = tryAddEntities(world, entities)
      expect(actual).toBe(true)
    })
  })
})
