/* ESLint config for ct-frontend.
 * Balanced: TypeScript handles type errors via `tsc --noEmit`; ESLint catches
 * bugs and bad patterns that tsc won't (unused vars, hooks rules, etc.).
 * Most stylistic rules emit `warn` so they don't fail CI by default — use
 * `eslint --max-warnings 0` if you want strict mode in deploy.
 */
module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: [
    'dist',
    'build',
    'node_modules',
    'coverage',
    '.eslintrc.cjs',
    '*.config.*',
    'vite.config.*',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
    // tsc + tsconfig "strict" already cover types — keep ESLint focused on patterns.
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',

    // Native variant — the TS-aware one above is what we use.
    'no-unused-vars': 'off',
    'no-empty': ['warn', { allowEmptyCatch: true }],
    'no-constant-condition': ['warn', { checkLoops: false }],
    'prefer-const': 'warn',

    // Hooks: enforce — these are real bugs, not style.
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
}
