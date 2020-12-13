const { default: tsjPreset } = require('ts-jest/presets');

module.exports = {
  preset: 'ts-jest',
  rootDir: './',
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  testRegex: '(/test/.*\\.(test|spec))\\.[tj]sx?$',
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx"
  ],
  moduleNameWrapper: {
    '^@APP/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    "!**/node_modules/**",
    "!**/vendor/**"
  ]
}
