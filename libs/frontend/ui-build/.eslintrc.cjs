module.exports = {
  extends: ['../../../tools/web.eslintrc.cjs'],
  rules: {
    'vue/multi-word-component-names': [
      'error',
      {
        ignores: ['Build'],
      },
    ],
  },
}
