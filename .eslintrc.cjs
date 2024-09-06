/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: ['plugin:vue/vue3-recommended', 'eslint:recommended', '@vue/eslint-config-prettier'],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    // 'no-undef': 'error',
    'vue/multi-word-component-names': 0,
    'vue/no-undef-properties': [
      'error',
      {
        ignores: ['/^\\$/']
      }
    ]
  }
}
