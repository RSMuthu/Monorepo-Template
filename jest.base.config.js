module.exports = {
  roots: ['<rootDir>'],
  testRegex: '(/__tests__/.*|(\\.|/)(test))\\.(jsx?)$',
  testEnvironment: 'jsdom', // overridden based on the type of package we build - `jsdom` or `node`
  setupFilesAfterEnv: ['<rootDir>/jestEnvSetup.js'],
  collectCoverage: true,
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  projects: ['<rootDir>'],
  coverageDirectory: '<rootDir>/coverage/',
  verbose: true,
  moduleNameMapper: {
    '.+\\.(css|scss)$': 'identity-obj-proxy',
    // add any other mappings if needed ...
  },
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageReporters: ['text', 'json', 'lcov', 'html'],
  // This config is set for the global execution
  // Package specific alteration is done on the inherited config
  collectCoverageFrom: [
    '!packages/**/__tests__/*.{js,jsx}',
    'packages/**/src/*.{js,jsx}',
    'packages/**/lib/*.{js,jsx}',
    '!node_modules/',
    '!**/node_modules/**',
  ],
}
