// @ts-check

import stylisticTs from '@stylistic/eslint-plugin-ts';

// TODO: figure out what type to use here
export default {
  files: ['**/*.ts'],
  plugins: {
    '@stylistic/ts': stylisticTs,
  },
  rules: {
    '@stylistic/ts/semi': ['error', 'always'],

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
};
