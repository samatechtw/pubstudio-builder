module.exports = {
  displayName: 'frontend-feature-sites',
  preset: '../../../jest.preset.ts',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  coverageDirectory: '../../../coverage/libs/frontend/feature-sites',
}
