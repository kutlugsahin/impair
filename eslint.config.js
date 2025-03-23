import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    parserOptions: {
      sourceType: 'module',
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-constructor-return': 'error',
      'no-new-native-nonconstructor': 'error',
      'no-promise-executor-return': 'error',
      'no-unused-private-class-members': 'error',
      'no-multiple-empty-lines': 'error',
      'require-atomic-updates': 'error',
      'comma-dangle': ['warn', 'always-multiline'],
      'computed-property-spacing': ['error'],
      'eol-last': ['error', 'always'],
      'dot-location': ['error', 'property'],
      'function-call-argument-newline': ['warn', 'consistent'],
      'no-trailing-spaces': 'error',
      'no-extra-boolean-cast': 'off',
      'object-curly-spacing': ['error', 'always'],
      'semi': ['warn', 'never'],
      'quotes': ['warn', 'single'],
      'indent': ['error', 2, { SwitchCase: 1, ignoredNodes: ['PropertyDefinition'] }],
      '@typescript-eslint/no-this-alias': ['warn', { allowDestructuring: true, allowedNames: ['that', 'self'] }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': 'off',
      'no-this-alias': 'off',
      '@typescript-eslint/ban-ts-ignore': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-namespace': 'off',
      'prefer-spread': 'off',
    },
    par,
  }
)
