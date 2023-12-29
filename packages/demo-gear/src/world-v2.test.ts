import { describe, expect, test } from '@jest/globals'
import {
  Entity,
  entityType,
  BeltEntity,
} from './types-entity.js'
import { initWorld, addEntities } from './world-v2.js'

function newBelt(): BeltEntity {
  return {
    id: '0',
    type: entityType.enum.Belt,
    items: [],
    position: [0, 0],
    size: [1, 1],
    velocity: 0,
    offset: 0,
  }
}

describe('world-v2', () => {
  describe('initWorld', () => {
    test('new world', () => {
      const actual = initWorld()
      expect(actual).toMatchSnapshot()
    })
  })

  describe('addEntities', () => {
    test('empty', () => {
      const world = initWorld()
      const { origin, derived } = world
      const entities: Entity[] = []
      addEntities(world, entities)

      expect(origin).toBe(world.origin)
      expect(derived).not.toBe(world.derived)

      expect(world).toMatchSnapshot()
    })

    test('add belt', () => {
      const world = initWorld()
      const entities: Entity[] = [newBelt()]
      addEntities(world, entities)
      expect(world).toMatchSnapshot()
    })

    test('replace belt', () => {
      const world = initWorld()
      const entities: Entity[] = [newBelt()]
      addEntities(world, entities)
      addEntities(world, entities)
      expect(world).toMatchSnapshot()
    })
  })
})
