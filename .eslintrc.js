module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true, // Enable Jest environment
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jest/recommended', // Enable Jest rules
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  globals: {
    React: 'writable', // Make React available globally
    expect: 'readonly', // Make `expect` available in tests
  },
  rules: {
    // Turn off specific rules if needed
    'react/prop-types': 'off', // Disable prop-types validation
    'no-undef': 'error', // Ensure all variables are defined
    'react/react-in-jsx-scope': 'off', // Disable React import requirement in JSX scope (if using React 18+)
  },
};
