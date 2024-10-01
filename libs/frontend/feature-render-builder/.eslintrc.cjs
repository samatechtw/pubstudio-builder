module.exports = {
  extends: ['../../../tools/web.eslintrc.cjs'],
  rules: {
    '@typescript-eslint/no-duplicate-enum-values': 'off',
    'vue/multi-word-component-names': [
      'error',
      {
        ignores: ['Build'],
      },
    ],
  },
}
