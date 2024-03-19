// @ts-check

import stylisticJs from '@stylistic/eslint-plugin-js';
import tseslint from 'typescript-eslint';

// TODO: figure out what type to use here
export default {
  plugins: {
    '@stylistic/js': stylisticJs,
  },
  files: ['**/*.js', '**/*.cjs', '*.cjs', '*.js'],
  extends: [tseslint.configs.disableTypeChecked],
  rules: {
    '@stylistic/js/semi': ['error', 'always'],
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
};
