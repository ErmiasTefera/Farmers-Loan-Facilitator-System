import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
	globalIgnores(['dist']),
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs['recommended-latest'],
			reactRefresh.configs.vite,
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		rules: {
			// Turn off formatting/style rules to avoid massive diffs; use a formatter separately if desired
			indent: 'off',
			'no-tabs': 'off',
			quotes: 'off',
			semi: 'off',
			'comma-dangle': 'off',
			'object-curly-spacing': 'off',
			'array-bracket-spacing': 'off',
			'arrow-spacing': 'off',
			'keyword-spacing': 'off',
			'space-before-blocks': 'off',
			'space-before-function-paren': 'off',
			'space-in-parens': 'off',
			'space-infix-ops': 'off',
			'no-multiple-empty-lines': 'off',
			'eol-last': 'off',
			'no-trailing-spaces': 'off',
			'sort-imports': 'off',
			'no-empty': 'off',
			// React JSX formatting rules disabled
			'react/jsx-indent': 'off',
			'react/jsx-indent-props': 'off',
			'react/jsx-closing-bracket-location': 'off',
			'react/jsx-closing-tag-location': 'off',
			'react/jsx-curly-spacing': 'off',
			'react/jsx-equals-spacing': 'off',
			'react/jsx-first-prop-new-line': 'off',
			'react/jsx-max-props-per-line': 'off',
			'react/jsx-one-expression-per-line': 'off',
			'react/jsx-props-no-multi-spaces': 'off',
			'react/jsx-tag-spacing': 'off',
		},
	},
])
