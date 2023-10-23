module.exports = {
  displayName: 'frontend-data-access-site-api',
  preset: '../../../jest.preset.ts',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  transformIgnorePatterns: ['../../../node_modules/(?!@sampullman/*)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/frontend/data-access-site-api',
  testTimeout: 10000,
}
