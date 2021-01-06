/**
 * Webpack config for production electron main process
 */
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';
import CheckNodeEnv from '../scripts/CheckNodeEnv';
import DeleteSourceMaps from '../scripts/DeleteSourceMaps';

import baseConfig from './webpack.config.base';

const NODE_ENV = 'production';
CheckNodeEnv(NODE_ENV);
DeleteSourceMaps();

const DevTools = process.env.DEBUG_PROD === 'true' ? { devtool: 'source-map' } : {};

const ROOT_DIR = path.join(__dirname, '../..');
const APP_DIR = path.join(ROOT_DIR, 'src');

export default merge(baseConfig, {
  mode: NODE_ENV,
  ...DevTools,
  entry: './src/main.dev.ts',
  output: {
    filename: 'main.prod.js',
    path: APP_DIR
  },
  plugins: [
    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV,
      DEBUG_PROD: false,
      START_MINIMIZED: false
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          mangle: false
        }
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
});
