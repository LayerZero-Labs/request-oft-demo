module.exports = {
	overrides: [
		{
			files: "*.sol",
			options: {
				bracketSpacing: false,
				printWidth: 300,
				tabWidth: 4,
				useTabs: false,
				singleQuote: false,
				explicitTypes: "never",
			},
		},
		{
			files: "*.js",
			options: {
				printWidth: 300,
				semi: false,
				tabWidth: 4,
				useTabs: false,
				trailingComma: "es5",
			},
		},
	],
}
