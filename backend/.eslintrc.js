module.exports = {
    env: {
      node: true,   // Enable Node.js global variables
      es2021: true, // Use ECMAScript 2021 features
    },
    extends: [
      'eslint:recommended',
      'airbnb-base', // Airbnb style guide for consistent code style
    ],
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
    rules: {
      'no-console': 'off', // Allow console statements
      'no-unused-vars': ['warn', { args: 'none' }], // Warn about unused variables, except function arguments
      'quotes': ['error', 'single'], // Enforce single quotes
      'semi': ['error', 'always'], // Enforce semicolons
      'no-undef': 'error', // Ensure all variables are defined
      'no-process-env': 'off', // Allow process.env usage
      'no-process-exit': 'off', // Allow process.exit usage
      'no-case-declarations': 'off', // Allow lexical declarations in case blocks
      'prefer-const': 'warn', // Prefer const for variables that are not reassigned
      'eqeqeq': ['error', 'always'], // Enforce strict equality (===)
      'curly': ['error', 'all'], // Enforce consistent brace style for all control statements
      'indent': ['error', 2], // Enforce consistent indentation (2 spaces)
      'max-len': ['warn', { code: 80 }], // Limit the length of lines to 80 characters
      'consistent-return': 'warn', // Enforce consistent return statements in functions
      'no-magic-numbers': ['warn', { ignore: [0, 1] }], // Warn about magic numbers, except 0 and 1
      'no-var': 'error', // Disallow var declarations
      'vars-on-top': 'error', // Enforce variable declarations to be at the top of their scope
      'camelcase': ['error', { properties: 'always' }], // Enforce camelCase naming convention
    },
  };
  