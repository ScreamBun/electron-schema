/**
 * Webpack config for production electron main process
 */
import baseConfig from './webpack.config.base'

import webpack from 'webpack'
import merge from 'webpack-merge'
import path from 'path'

import TerserPlugin from 'terser-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv'

const env = 'production'
CheckNodeEnv(env)

const ROOT_DIR = path.join(__dirname, '..')

export default merge.smart(baseConfig, {
  mode: env,
  devtool: 'source-map',
  entry: './app/main.dev',
  output: {
    path: ROOT_DIR,
    filename: './app/main.prod.js'
  },
  plugins: [
    /**
     * Create global constants which can be configured at compile time
     * Useful for allowing different behaviour between development builds and release builds
     * NODE_ENV should be production so that modules do not perform certain development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: env,
      DEBUG_PROD: false,
      START_MINIMIZED: false
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    })
  ],
  optimization: {
    minimizer: process.env.E2E_BUILD
      ? []
      : [
        new TerserPlugin({
          parallel: true,
          sourceMap: true,
          cache: true
        })
      ]
  },
  target: 'electron-main',
  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false
  }
})
