import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  globalIgnores(['.next/**', 'coverage/**', 'node_modules/**', 'next-env.d.ts']),
  {
    files: ['__tests__/**', 'test-utils/**', 'jest.setup.js'],
    languageOptions: { globals: { jest: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly', beforeEach: 'readonly', afterEach: 'readonly', afterAll: 'readonly' } }
  }
])
