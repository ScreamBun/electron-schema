/**
 * Webpack config for production electron main process
 */
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import merge from 'webpack-merge';

import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';
import DeleteSourceMaps from '../internals/scripts/DeleteSourceMaps';

const NODE_ENV = 'production';
CheckNodeEnv(NODE_ENV);
DeleteSourceMaps();

const ROOT_DIR = path.join(__dirname, '..');
const APP_DIR = path.join(ROOT_DIR, 'app');
const DIST_DIR = path.join(APP_DIR, 'dist', 'main');

const minimizer = [];
if (!process.env.E2E_BUILD) {
  minimizer.push(
    new TerserPlugin({
      parallel: true,
      sourceMap: true,
      cache: true
    })
  );
}

export default merge.smart(baseConfig, {
  mode: NODE_ENV,
  devtool: process.env.DEBUG_PROD === 'true' ? 'cheap-source-map' : 'none',
  entry: './app/main',
  output: {
    path: DIST_DIR,
    filename: 'main.js'
  },
  plugins: [
    /**
     * Create global constants which can be configured at compile time
     * Useful for allowing different behaviour between development builds and release builds
     * NODE_ENV should be production so that modules do not perform certain development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV,
      DEBUG_PROD: false,
      START_MINIMIZED: false,
      E2E_BUILD: false
    }),
    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    })
  ],
  optimization: {
    minimizer
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
});
