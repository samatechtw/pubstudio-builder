module.exports = {
  extends: ['../../tools/web-site.eslintrc.cjs'],
  rules: {
    'vue/multi-word-component-names': [
      'error',
      {
        ignores: ['Info'],
      },
    ],
  },
}
