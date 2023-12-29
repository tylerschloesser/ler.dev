import { describe, expect, test } from '@jest/globals'
import {
  Entity,
  entityType,
  BeltEntity,
} from './types-entity.js'
import { initWorld, tryAddEntities } from './world-v2.js'

function newBelt(
  args: Partial<BeltEntity> = {},
): BeltEntity {
  return {
    id: '0',
    type: entityType.enum.Belt,
    items: [],
    position: [0, 0],
    size: [1, 1],
    velocity: 0,
    offset: 0,
    ...args,
  }
}

describe('world-v2', () => {
  describe('initWorld', () => {
    test('new world', () => {
      const actual = initWorld()
      expect(actual).toMatchSnapshot()
    })
  })

  describe('tryAddEntities', () => {
    test('empty', () => {
      const world = initWorld()
      const { origin, derived } = world
      const entities: Entity[] = []
      expect(tryAddEntities(world, entities)).toBeNull()

      expect(origin).toBe(world.origin)
      expect(derived).not.toBe(world.derived)

      expect(world).toMatchSnapshot()
    })

    test('add belt', () => {
      const world = initWorld()
      const entities: Entity[] = [newBelt()]
      expect(tryAddEntities(world, entities)).toBeNull()
      expect(world).toMatchSnapshot()
    })

    test('replace belt', () => {
      const world = initWorld()
      const entities: Entity[] = [newBelt()]
      expect(tryAddEntities(world, entities)).toBeNull()
      expect(tryAddEntities(world, entities)).toBeNull()
      expect(world).toMatchSnapshot()
    })

    test('add two disconnected belts', () => {
      const world = initWorld()
      const entities: Entity[] = [
        newBelt({
          id: '0',
          position: [0, 0],
        }),
        newBelt({
          id: '1',
          position: [2, 0],
        }),
      ]
      expect(tryAddEntities(world, entities)).toBeNull()
      expect(world).toMatchSnapshot()
    })

    test('add two connected belts', () => {
      const world = initWorld()
      const entities: Entity[] = [
        newBelt({
          id: '0',
          position: [0, 0],
        }),
        newBelt({
          id: '1',
          position: [1, 0],
        }),
      ]
      expect(tryAddEntities(world, entities)).toBeNull()
      expect(world).toMatchSnapshot()
    })
  })
})
