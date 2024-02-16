module.exports = {
  displayName: 'frontend-feature-external',
  preset: '../../../jest.preset.ts',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js'],
  setupFiles: [],
  coverageDirectory: '../../../coverage/libs/frontend/feature-external',
}
