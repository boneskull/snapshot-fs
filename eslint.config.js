import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsConfig from './.config/eslint-js.config.js';
import tsConfig from './.config/eslint-ts.config.js';

// TODO: setup eslint-plugin-jsonc & eslint-plugin-n
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './.config/tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  tsConfig,
  jsConfig,
  {
    ignores: ['dist', 'coverage', '__snapshots__', '.tshy*'],
  },
);
