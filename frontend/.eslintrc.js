module.exports = {
  root: true,
  extends: [
    'airbnb',
    'plugin:cypress/recommended',
  ],
  env: {
    es6: true,
    browser: true,
  },
  globals: {
    __API__: false,
    __APPNAME__: false,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      legacyDecorators: true,
    },
  },
  rules: {
    'arrow-body-style': ['error', 'as-needed'],
    'arrow-parens': ['error', 'as-needed'],
    'class-methods-use-this': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'guard-for-in': 'off',
    'import/extensions': ['error', 'never', { json: 'always' }],
    'import/no-cycle': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'max-len': ['warn', 120, 2, {
      ignoreUrls: true,
      ignoreComments: false,
    }],
    'new-cap': ['error', { capIsNew: false }],
    'no-continue': 'off',
    'no-param-reassign': ['error', { props: false }],
    'no-restricted-syntax': 'off',
    'no-plusplus': 'off',
    'no-underscore-dangle': 'off',
    'no-use-before-define': 'off',
    'object-curly-newline': ['error', {
      ObjectExpression: { multiline: true },
      ObjectPattern: { multiline: true },
      ImportDeclaration: { multiline: true },
      ExportDeclaration: { multiline: true },
    }],
    'react/destructuring-assignment': 'off',
    'react/jsx-closing-bracket-location': ['warn', 'line-aligned'],
    'react/jsx-first-prop-new-line': ['warn', 'multiline'],
    'react/jsx-filename-extension': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/forbid-prop-types': 'off',
    'react/prefer-stateless-function': 'off',
    'react/prop-types': 'off',
    'react/sort-comp': [
      'error', {
        order: [
          'static-methods',
          'instance-variables',
          'lifecycle',
        ],
      },
    ],
    'react/static-property-placement': 'off',
  },
  settings: {
    'import/resolver': { webpack: { config: 'config/webpack.base.js' } },
    createClass: 'createReactClass',
    pragma: 'React',
    version: '17.0',
  },
  plugins: [
    'react',
  ],
};
