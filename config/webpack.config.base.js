/**
 * Base webpack config used across other specific configs
 */
import webpack from 'webpack'
import path from 'path'

import { dependencies } from '../package.json'

const env = 'production'

const ROOT_DIR = path.join(__dirname, '..')
const APP_DIR = path.join(ROOT_DIR, 'app')

export default {
  mode: env,
  output: {
    path: APP_DIR,
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },
  // Determine the array of extensions that should be used to resolve modules
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  externals: [...Object.keys(dependencies || {})],
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: env
    }),
    new webpack.NamedModulesPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      }
    ]
  }
}
