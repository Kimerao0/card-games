import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';

import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],

    // Flat config: i plugin si dichiarano qui
    plugins: {
      import: importPlugin,
      '@typescript-eslint': tseslint.plugin,
    },

    extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      // (opzionale) se vuoi essere esplicito:
      // parser: tseslint.parser,
      // parserOptions: { project: './tsconfig.json' },
    },

    settings: {
      // fa capire a eslint-plugin-import dove risolvere i path alias di TS
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },

    rules: {
      // (opzionale ma utile) abilita check import più “reali”
      'import/no-unresolved': 'error',
    },
  },
]);
