module.exports = {
  displayName: 'frontend-feature-copy-paste',
  preset: '../../../jest.preset.ts',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: [1343],
        },
        tsconfig: '<rootDir>/tsconfig.spec.json',
        astTransformers: {
          before: [
            {
              path: 'node_modules/ts-jest-mock-import-meta',
              options: { metaObjectReplacement: { hot: '' } },
            },
          ],
        },
      },
    ],
  },
  globals: {
    window: {},
    navigator: {},
  },
  moduleFileExtensions: ['ts', 'js'],
  setupFiles: ['jest-localstorage-mock'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  coverageDirectory: '../../../coverage/libs/frontend/feature-copy-paste',
}
