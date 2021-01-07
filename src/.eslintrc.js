module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'arrow-spacing': 'warn',
    'brace-style': 'warn',
    'comma-dangle': 'warn',
    'comma-spacing': 'warn',
    eqeqeq: 'warn',
    indent: 'warn',
    'key-spacing': 'warn',
    'keyword-spacing': 'warn',
    'no-multi-spaces': 'warn',
    'no-multiple-empty-lines': 'warn',
    'no-tabs': 'warn',
    'no-trailing-spaces': 'warn',
    'no-unneeded-ternary': 'warn',
    'object-curly-spacing': 'warn',
    'padded-blocks': 'warn',
    'prefer-const': 'warn',
    'quote-props': 'warn',
    quotes: 'warn',
    semi: 'warn',
    'space-before-blocks': 'warn',
    'space-before-function-paren': 'warn',
    'space-in-parens': 'warn',
    'space-infix-ops': 'warn',
    'spaced-comment': 'warn'
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        'src/testUtils/**/*.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
