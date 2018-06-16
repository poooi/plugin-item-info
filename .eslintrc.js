module.exports = {
  extends: ['airbnb', 'poi-plugin', 'prettier', 'prettier/react'],
  plugins: ['react', 'jsx-a11y', 'import', 'prettier'],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parser: 'babel-eslint',
  rules: {
    semi: ['error', 'never'],
    'import/no-unresolved': [2, { ignore: ['views/.*'] }],
    'react/jsx-filename-extension': 'off',
    'no-underscore-dangle': ['error', { allow: ['__'], allowAfterThis: true }],
    'import/extensions': ['error', { es: 'never' }],
    'import/no-extraneous-dependencies': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    camelcase: 'off',
    'no-confusing-arrow': 'off',
    'prettier/prettier': 'error',
  },
}
