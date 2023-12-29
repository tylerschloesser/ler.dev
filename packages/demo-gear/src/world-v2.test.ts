import { describe, expect, test } from '@jest/globals'
import { vec2 } from 'gl-matrix'
import invariant from 'tiny-invariant'
import {
  DerivedError,
  DerivedErrorType,
  Vec2,
} from './types-common.js'
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

function newBelts(positions: vec2[]): Entity[] {
  const entities: Entity[] = []
  for (let i = 0; i < positions.length; i++) {
    const position = positions.at(i)
    invariant(position !== undefined)
    entities.push(
      newBelt({
        id: `${i}`,
        // TODO why is this cast needed?
        position: position as Vec2,
      }),
    )
  }
  return entities
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
      const entities = newBelts([
        [0, 0],
        [2, 0],
      ])
      expect(tryAddEntities(world, entities)).toBeNull()
      expect(world).toMatchSnapshot()
    })

    test('add two connected horizontal belts', () => {
      const world = initWorld()
      const entities = newBelts([
        [0, 0],
        [1, 0],
      ])
      expect(tryAddEntities(world, entities)).toBeNull()
      expect(world).toMatchSnapshot()
    })

    test('more than two adjacent belts error', () => {
      const world = initWorld()
      const entities = newBelts([
        [0, 0],
        [1, 0],
        [2, 0],
        [1, 1],
      ])
      const expected: DerivedError = {
        type: DerivedErrorType.BeltHasMoreThanTwoAdjacentBelts,
        entityId: '1',
      }
      expect(tryAddEntities(world, entities)).toEqual(
        expected,
      )
      expect(world).toMatchSnapshot()
    })
  })
})
