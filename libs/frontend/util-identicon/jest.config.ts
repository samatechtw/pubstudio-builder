module.exports = {
  displayName: 'frontend-util-identicon',
  preset: '../../../jest.preset.ts',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../../coverage/libs/frontend/util-identicon',
}
