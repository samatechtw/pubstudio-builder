module.exports = {
  displayName: 'frontend-ui-runtime',
  preset: '../../../jest.preset.ts',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js'],
  setupFiles: ['jest-localstorage-mock'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  coverageDirectory: '../../../coverage/libs/frontend/ui-runtime',
}
