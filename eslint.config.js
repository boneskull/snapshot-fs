// @ts-check

import eslintPluginJsonc from 'eslint-plugin-jsonc';
import tseslint from 'typescript-eslint';
import jsConfig from './.config/eslint-js.config.js';
import tsConfig from './.config/eslint-ts.config.js';

// TODO: setup eslint-plugin-jsonc & eslint-plugin-n
export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './.config/tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.json5', '.jsonc'],
      },
    },
  },
  // @ts-expect-error - FIXME
  tsConfig,
  jsConfig,
  {
    files: ['src/test/**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  eslintPluginJsonc.configs['flat/prettier'][0],
  {
    ...eslintPluginJsonc.configs['flat/prettier'][1],
    extends: [tseslint.configs.disableTypeChecked],
  },
  eslintPluginJsonc.configs['flat/prettier'][2],
  {
    ignores: ['dist', 'coverage', '__snapshots__', '.tshy*'],
  },
);
