module.exports = {
  extends: ['../../tools/web-site.eslintrc.js'],
  rules: {
    'vue/multi-word-component-names': [
      'error',
      {
        ignores: ['Info'],
      },
    ],
  },
}
