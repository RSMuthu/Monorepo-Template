module.exports = {
  ...require('../../../jest.base.config'),
  setupFilesAfterEnv: ['../../../jestEnvSetup.js'],
  displayName: '@rsmk/sample-button',
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**.{js,jsx}',
  ],
}
