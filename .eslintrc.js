module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:playwright/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['playwright'],
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    'no-console': 'off',
    'playwright/missing-playwright-await': 'error',
    'playwright/no-element-handle': 'warn',
    'playwright/no-eval': 'error',
    'playwright/no-focused-test': 'error',
    'playwright/no-skipped-test': 'warn',
    'playwright/no-wait-for-timeout': 'warn',
    'playwright/prefer-web-first-assertions': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    'playwright-report/',
    'test-results/',
    '*.config.js'
  ]
};
