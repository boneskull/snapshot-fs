// @ts-check

import stylisticJs from '@stylistic/eslint-plugin-js';

// TODO: figure out what type to use here
export default {
  plugins: {
    '@stylistic/js': stylisticJs,
  },
  files: ['**/*.js', '**/*.cjs'],
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
