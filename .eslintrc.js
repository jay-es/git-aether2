module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/standard',
    '@vue/prettier',
    '@vue/typescript'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    '@vue/prettier': [
      process.env.NODE_ENV === 'production' ? 'error' : 'off',
      require('./.prettierrc')
    ]
  },
  parserOptions: {
    parser: '@typescript-eslint/parser'
  }
}
