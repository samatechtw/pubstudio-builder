const nxPreset = require('@nx/jest/preset').default

module.exports = {
  ...nxPreset,
  restoreMocks: true,
  resetMocks: true,
}
