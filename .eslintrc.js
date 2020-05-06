module.exports = {
  extends: 'erb/typescript',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./config/webpack.config.eslint.js')
      }
    }
  },
  rules: {
    ...require('./config/eslint_rules'),
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 0
  }
};
