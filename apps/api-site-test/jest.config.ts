module.exports = {
  displayName: 'api-site-test',
  preset: '../../jest.preset.ts',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[t]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api-site-test',
  testMatch: ['**/test/**/+(*.)+(spec).+(ts)'],
  setupFilesAfterEnv: ['./jest-setup.ts'],
}
