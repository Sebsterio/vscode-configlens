/**@type {import('eslint').Linter.Config} */
// eslint-disable-next-line no-undef
module.exports = {
	root: true,
	env: {
		node: true,
		es6: true,
	},
	ignorePatterns: ['node_modules', 'out'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		project: './tsconfig.json',
		tsconfigRootDir: '.',
	},
	plugins: ['@typescript-eslint'],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
	rules: {
		'no-console': 0,
		'@typescript-eslint/no-unused-vars': [1, { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
		'no-sparse-arrays': 0,
	},
	overrides: [
		{
			files: ['.eslintrc.js'],
			parser: 'espree',
		},
	],
};
