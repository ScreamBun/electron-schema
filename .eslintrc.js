module.exports = {
  extends: 'erb',
  settings: {
    'import/resolver': {
      webpack: {
        config: require.resolve('./config/webpack.config.eslint.js')
      }
    }
  }
}
