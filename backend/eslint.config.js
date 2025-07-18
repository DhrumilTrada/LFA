// eslint.config.js
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import noWarningComments from 'eslint-plugin-no-warning-comments';

export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,
  
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'no-warning-comments': noWarningComments,
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-warning-comments/no-warning-comments': [2, { terms: ['fixme'], location: 'start' }],
    },
  },

  {
    rules: {
      ...prettier.rules,
    },
  },
];
