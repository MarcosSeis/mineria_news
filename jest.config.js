const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

module.exports = createJestConfig({
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  collectCoverageFrom: [
    'components/**/*.js',
    'pages/**/*.js',
    'lib/**/*.js',
    'utils/**/*.js',
    'data/**/*.js',
    '!pages/_document.js'
  ],
  coverageThreshold: { global: { statements: 90, branches: 80, functions: 90, lines: 90 } }
})
