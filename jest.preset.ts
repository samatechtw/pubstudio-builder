const nxPreset = require('@nrwl/jest/preset').default

module.exports = {
  ...nxPreset,
  restoreMocks: true,
  resetMocks: true,
}
