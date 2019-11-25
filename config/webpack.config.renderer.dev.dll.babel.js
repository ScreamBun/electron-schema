/* eslint global-require: off, import/no-dynamic-require: off */

/**
 * Builds the DLL for development electron renderer process
 */
import baseConfig from './webpack.base'

import webpack from 'webpack'
import merge from 'webpack-merge'
import path from 'path'

import { dependencies } from '../package.json'
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv'

const env = 'development'
CheckNodeEnv(env)
console.log('NODE_ENV - Renderer.dll: ' + env)

const ROOT_DIR = path.join(__dirname, '..')
const APP_DIR = path.join(ROOT_DIR, 'app')
const DLL_DIR = path.join(ROOT_DIR, 'dll')
const DIST_DIR = path.join(APP_DIR, 'dist')

export default merge.smart(baseConfig, {
  mode: env,
  devtool: 'eval',
  entry: {
    renderer: Object.keys(dependencies || {})
  },
  output: {
    library: 'renderer',
    path: DIST_DIR,
    filename: '[name].dev.dll.js',
    libraryTarget: 'var'
  },
  context: ROOT_DIR,
  plugins: [
    new webpack.DllPlugin({
      path: path.join(DIST_DIR, '[name].json'),
      name: '[name]'
    }),
    /**
     * Create global constants which can be configured at compile time.
     * Useful for allowing different behaviour between development builds and release builds
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: env
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: APP_DIR,
        output: {
          path: DLL_DIR
        }
      }
    })
  ],
  target: 'electron-renderer',
  externals: ['fsevents', 'crypto-browserify'],
  // Use `module` from `webpack.config.renderer.dev.js`
  module: require('./webpack.renderer.dev.babel').default.module
})