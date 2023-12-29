import { describe, expect, test } from '@jest/globals'
import { vec2 } from 'gl-matrix'
import { cloneDeep } from 'lodash-es'
import invariant from 'tiny-invariant'
import { Vec2 } from './types-common.js'
import {
  BuildBeltEntity,
  BuildEntity,
  entityType,
} from './types-entity.js'
import { initWorld, tryAddEntities } from './world-v2.js'

function newBelt(
  args: Partial<BuildBeltEntity> = {},
): BuildBeltEntity {
  return {
    type: entityType.enum.Belt,
    items: [],
    position: [0, 0],
    size: [1, 1],
    velocity: 0,
    offset: 0,
    ...args,
  }
}

function newBelts(positions: vec2[]): BuildBeltEntity[] {
  const entities: BuildBeltEntity[] = []
  for (let i = 0; i < positions.length; i++) {
    const position = positions.at(i)
    invariant(position !== undefined)
    entities.push(
      newBelt({
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
      const expected = cloneDeep(world)
      const entities: BuildEntity[] = []
      const actual = tryAddEntities(world, entities)
      expect(actual.right).toBe(world)
      expect(actual.right).toEqual(expected)
    })

    test('add belt', () => {
      const world = initWorld()
      const entities: BuildEntity[] = [newBelt()]
      expect(
        tryAddEntities(world, entities),
      ).toMatchSnapshot()
    })

    test('replace belt', () => {
      const world = initWorld()
      const entities: BuildEntity[] = [newBelt()]
      expect(
        tryAddEntities(world, entities),
      ).toMatchSnapshot()
      expect(
        tryAddEntities(world, entities),
      ).toMatchSnapshot()
    })

    test('add two disconnected belts', () => {
      const world = initWorld()
      const entities = newBelts([
        [0, 0],
        [2, 0],
      ])
      expect(
        tryAddEntities(world, entities),
      ).toMatchSnapshot()
    })

    // prettier-ignore
    const testCases: [string, vec2[]][] = [
      ['west-east', [[0, 0], [1, 0], [2, 0]]],
      ['inverted west-east', [[2, 0], [1, 0], [0, 0]]],
      ['north-south', [[0, 0], [0, 1], [0, 2]]],
      ['inverted north-south', [[0, 2], [0, 1], [0, 0]]],
      ['west-north', [[0, 0], [1, 0], [1, -1]]],
      ['inverted west-north', [[1, -1], [1, 0], [0, 0]]],
      ['north-east', [[0, 0], [0, 1], [1, 1]]],
      ['inverted north-east', [[0, 0], [-1, 0], [-1, -1]]],
      ['east-south', [[0, 0], [-1, 0], [-1, 1]]],
      ['inverted east-south', [[0, 0], [0, -1], [1, -1]]],
      ['south-west', [[0, 0], [1, 0], [1, 1]]],
      ['inverted south-west', [[0, 0], [0, -1], [-1, -1]]],
    ]

    for (const testCase of testCases) {
      test(`add ${testCase[0]} belt`, () => {
        const world = initWorld()
        const entities = newBelts(testCase[1])
        expect(
          tryAddEntities(world, entities),
        ).toMatchSnapshot()
      })
    }

    test('more than two adjacent belts error', () => {
      const world = initWorld()
      const entities = newBelts([
        [0, 0],
        [1, 0],
        [2, 0],
        [1, 1],
      ])
      expect(
        tryAddEntities(world, entities),
      ).toMatchSnapshot()
    })

    test('add belt loop', () => {
      const world = initWorld()
      let actual = tryAddEntities(
        world,
        newBelts([
          [0, 0],
          [1, 0],
          [2, 0],
          [2, 1],
          [2, 2],
        ]),
      )
      expect(actual).toMatchSnapshot()

      invariant(actual.right)
      actual = tryAddEntities(
        actual.right,
        newBelts([
          [2, 2],
          [1, 2],
          [0, 2],
          [0, 1],
          [0, 0],
        ]),
      )
      expect(actual).toMatchSnapshot()
    })
  })
})
