/**@type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	env: { node: true, es6: true },
	ignorePatterns: ['node_modules', 'out'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
		tsconfigRootDir: '.',
	},
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
	plugins: ['@typescript-eslint'],
	rules: {
		'no-console': 1,
		'@typescript-eslint/no-unused-vars': [1, { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
		'no-sparse-arrays': 0,
	},
	reportUnusedDisableDirectives: true,
};
