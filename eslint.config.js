// @ts-check

import jsPlugin from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import eslintPluginJsonc from 'eslint-plugin-jsonc';
import nodePlugin from 'eslint-plugin-n';
import perfectionist from 'eslint-plugin-perfectionist';
import tseslint from 'typescript-eslint';

// TODO: setup eslint-plugin-n
export default tseslint.config(
  jsPlugin.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  nodePlugin.configs['flat/recommended-script'],
  perfectionist.configs['recommended-natural'],
  {
    languageOptions: {
      parserOptions: {
        extraFileExtensions: ['.json5', '.jsonc'],
        project: './.config/tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.ts'],
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/lines-around-comment': [
        'warn',
        {
          allowArrayStart: true,
          allowBlockStart: true,
          allowClassStart: true,
          allowInterfaceStart: true,
          // these conflict with prettier, so we must allow them
          allowObjectStart: true,
          beforeBlockComment: true,
        },
      ],

      '@stylistic/semi': 'error',

      '@typescript-eslint/consistent-type-exports': [
        'error',
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: true,
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],

      // and sometimes you gotta use any
      '@typescript-eslint/no-explicit-any': 'off',

      // this rule seems broken
      '@typescript-eslint/no-invalid-void-type': 'off',

      // unfortunately required when using Sets and Maps
      '@typescript-eslint/no-non-null-assertion': 'off',

      '@typescript-eslint/no-unnecessary-boolean-literal-compare': [
        'error',
        {
          allowComparingNullableBooleansToFalse: true,
          allowComparingNullableBooleansToTrue: true,
        },
      ],
      // too many false positives
      '@typescript-eslint/no-unnecessary-condition': 'off',
      // these 6 bytes add up
      '@typescript-eslint/require-await': 'off',

      // I like my template expressions, tyvm
      '@typescript-eslint/restrict-template-expressions': 'off',

      '@typescript-eslint/unified-signatures': [
        'error',
        {
          ignoreDifferentlyNamedParameters: true,
        },
      ],

      // fixes issue when importing from memfs because enhanced-resolve is dubious
      'n/no-missing-import': [
        'error',
        {
          allowModules: ['memfs'],
        },
      ],
    },
  },
  {
    extends: [tseslint.configs.disableTypeChecked],
    files: ['**/*.js', '**/*.cjs', '*.cjs', '*.js'],
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/lines-around-comment': [
        'warn',
        {
          allowClassStart: true,
          // these conflict with prettier, so we must allow them
          allowObjectStart: true,
          beforeBlockComment: true,
        },
      ],
      '@stylistic/semi': 'error',
    },
  },
  {
    files: ['src/cli.ts'],
    rules: {
      'n/hashbang': 'off',
    },
  },
  {
    files: ['test/**/*.test.ts'],
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
    ignores: ['dist', 'coverage', '*.snapshot', '.tshy*'],
  },
);
