module.exports = {
  extends: 'erb',
  settings: {
    'import/resolver': {
      webpack: {
        config: require.resolve('./config/webpack.config.eslint.js')
      }
    }
  },
  rules: {
    'keyword-spacing': [
      'error',
      {
        'before': true
      }
    ],
    'max-len': [
      'error',
      128,
      {
        "ignoreComments": true,
        "ignoreStrings": true,
      	"tabWidth": 2
	    }
    ],
    'multiline-ternary': [
      'error',
      'never'
    ],
    'no-plusplus': [
      "warn",
      {
        "allowForLoopAfterthoughts": true
      }
    ],
    'no-useless-concat': 'error',
    'operator-linebreak': [
      'error',
      'none'
    ]
  }
}
