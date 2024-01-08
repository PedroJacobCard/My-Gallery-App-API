module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: 'airbnb-base',
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'class-method-use-this': 'off',
    'no-params-reassign': 'off',
    camelcase: 'off',
    'linebreak-style': 'off',
    'import/no-extraneous-dependencies': 'off',
    'spaced-comment': 'off',
    'class-methods-use-this': 'off',
    radix: 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
  },
};
