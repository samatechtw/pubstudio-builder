module.exports = {
  env: {
    node: true,
  },
  extends: [
    '../.eslintrc.json',
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    'prettier',
  ],
  plugins: ['import'],
  parser: 'vue-eslint-parser',
  parserOptions: { ecmaVersion: 2020 },
  ignorePatterns: ['!**/*', 'node_modules/'],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'prod' ? 'error' : 'off',
    'padded-blocks': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'keyword-spacing': ['error', { after: true }],
    'max-len': ['error', { code: 110, ignorePattern: '^\\s*<path' }],
    'no-param-reassign': [2, { props: false }],
    'object-curly-newline': [
      'error',
      {
        consistent: true,
        multiline: true,
      },
    ],
    'no-extra-boolean-cast': 'error',
    'import/extensions': [
      'error',
      'never',
      {
        vue: 'always',
        json: 'always',
        form: 'always',
        png: 'always',
        webm: 'always',
        svg: 'always',
        jpg: 'always',
        mp3: 'always',
        mp4: 'always',
      },
    ],
    'vue/attribute-hyphenation': ['error', 'never'],
    'vue/singleline-html-element-content-newline': [
      'error',
      {
        ignoreWhenNoAttributes: true,
        ignoreWhenEmpty: true,
      },
    ],
    'vue/no-v-html': 'off',
    'vue/v-on-event-hyphenation': 'off',
  },
}
