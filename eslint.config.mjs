import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', '.env', '.env.*'],
  },

  {
    files: ['**/*.{js,ts}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      prettierConfig,
    ],
  },
]);
