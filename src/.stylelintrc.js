module.exports = {
  extends: 'stylelint-config-standard',
  plugins: ['stylelint-order', 'stylelint-scss'],
  rules: {
    'at-rule-no-unknown': [true, {
      ignoreAtRules: ['function', 'if', 'for', 'each', 'include', 'mixin', 'content']
    }]
  }
}
