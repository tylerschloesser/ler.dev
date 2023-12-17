import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          // https://github.com/kulshekhar/ts-jest/issues/4198
          moduleResolution: 'node',
        },
      },
    ],
  },
  testPathIgnorePatterns: [
    // '/node_modules/',
    '<rootDir>/packages/draw-api/',
  ],
}

export default config
