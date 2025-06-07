import js from '@eslint/js'
import pluginNext from '@next/eslint-plugin-next'
import eslintConfigPrettier from 'eslint-config-prettier'
import onlyWarn from 'eslint-plugin-only-warn'
import perfectionist from 'eslint-plugin-perfectionist'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import turboPlugin from 'eslint-plugin-turbo'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const baseConfig = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      onlyWarn,
     perfectionist,
   //   turbo: turboPlugin,
    },
    rules: {
      /*
      'perfectionist/sort-imports': [
        'warn',
        {
          environment: 'node',
          groups: [
            'react',
            'type',
            ['builtin', 'external'],
            'internal-type',
            'internal',
            ['parent-type', 'sibling-type', 'index-type'],
            ['parent', 'sibling', 'index'],
            'object',
            'unknown',
          ],
          ignoreCase: true,
          internalPattern: ['^@/.+'],
          maxLineLength: undefined,
          newlinesBetween: 'always',
          order: 'asc',
          partitionByComment: false,
          partitionByNewLine: false,
          specialCharacters: 'keep',
          type: 'alphabetical',
        },
      ], */
      'perfectionist/sort-jsx-props': 'warn',
      'perfectionist/sort-named-exports': 'warn',
      'perfectionist/sort-named-imports': 'warn',
      'perfectionist/sort-objects': 'warn',
   //   'turbo/no-undeclared-env-vars': 'warn',
    },
  },
  {
    ignores: ['dist/**', '**/.next/**', '**/public/**' ,'**/components/ui/**'],
  },
]


/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const nextJsConfig = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    plugins: {
      '@next/next': pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
    },
  },
  {
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      'react/react-in-jsx-scope': 'off',
    },
    settings: { react: { version: 'detect' } },
  },
]

export default nextJsConfig
