/* eslint global-require: off, import/no-dynamic-require: off */

/**
 * Builds the DLL for development electron renderer process
 */
import webpack from 'webpack';
import merge from 'webpack-merge';
import path from 'path';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

import baseConfig from './webpack.config.base';
import { dependencies } from '../package.json';

const env = 'development';
CheckNodeEnv(env);

const ROOT_DIR = path.join(__dirname, '..');
const APP_DIR = path.join(ROOT_DIR, 'app');
const DLL_DIR = path.join(ROOT_DIR, 'dll');

export default merge.smart(baseConfig, {
  mode: env,
  devtool: 'eval',
  entry: {
    renderer: Object.keys(dependencies || {})
  },
  output: {
    library: 'renderer',
    path: DLL_DIR,
    filename: '[name].dev.dll.js',
    libraryTarget: 'var'
  },
  context: ROOT_DIR,
  plugins: [
    /**
     * Create global constants which can be configured at compile time
     * Useful for allowing different behaviour between development builds and release builds
     * NODE_ENV should be production so that modules do not perform certain development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: env
    }),
    new webpack.DllPlugin({
      path: path.join(DLL_DIR, '[name].json'),
      name: '[name]'
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
  module: require('./webpack.config.renderer.dev.babel').default.module
});
