// @ts-check

import stylisticJs from '@stylistic/eslint-plugin-js';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import eslintPluginJsonc from 'eslint-plugin-jsonc';
import tseslint from 'typescript-eslint';

// TODO: setup eslint-plugin-n
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
  {
    files: ['**/*.ts'],
    plugins: {
      '@stylistic/ts': stylisticTs,
    },
    rules: {
      '@stylistic/ts/semi': 'error',

      // I like my template expressions, tyvm
      '@typescript-eslint/restrict-template-expressions': 'off',

      // and sometimes you gotta use any
      '@typescript-eslint/no-explicit-any': 'off',

      // these 6 bytes add up
      '@typescript-eslint/require-await': 'off',

      // unfortunately required when using Sets and Maps
      '@typescript-eslint/no-non-null-assertion': 'off',

      // this rule seems broken
      '@typescript-eslint/no-invalid-void-type': 'off',

      '@typescript-eslint/no-unnecessary-boolean-literal-compare': [
        'error',
        {
          allowComparingNullableBooleansToTrue: true,
          allowComparingNullableBooleansToFalse: true,
        },
      ],
      '@typescript-eslint/unified-signatures': [
        'error',
        {
          ignoreDifferentlyNamedParameters: true,
        },
      ],
      // too many false positives
      '@typescript-eslint/no-unnecessary-condition': 'off',

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: true,
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],

      '@typescript-eslint/consistent-type-exports': [
        'error',
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],

      '@stylistic/ts/lines-around-comment': [
        'warn',
        {
          beforeBlockComment: true,
          // these conflict with prettier, so we must allow them
          allowObjectStart: true,
          allowClassStart: true,
          allowInterfaceStart: true,
          allowBlockStart: true,
          allowArrayStart: true,
        },
      ],
    },
  },
  {
    plugins: {
      '@stylistic/js': stylisticJs,
    },
    files: ['**/*.js', '**/*.cjs', '*.cjs', '*.js'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      '@stylistic/js/semi': 'error',
      '@stylistic/js/lines-around-comment': [
        'warn',
        {
          beforeBlockComment: true,
          // these conflict with prettier, so we must allow them
          allowObjectStart: true,
          allowClassStart: true,
        },
      ],
    },
  },
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
