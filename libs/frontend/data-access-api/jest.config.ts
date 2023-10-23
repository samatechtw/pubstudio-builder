module.exports = {
  displayName: 'frontend-data-access-api',
  preset: '../../../jest.preset.ts',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  transformIgnorePatterns: ['../../../node_modules/(?!@sampullman/*)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/frontend/data-access-api',
  testTimeout: 10000,
}
