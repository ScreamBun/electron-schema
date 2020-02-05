/**
 * Build config for production electron renderer process
 */
import webpack from 'webpack';
import merge from 'webpack-merge';
import path from 'path';
import glob from 'glob';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import TerserPlugin from 'terser-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

import baseConfig from './webpack.config.base';

const env = 'production';
CheckNodeEnv(env);

const ROOT_DIR = path.join(__dirname, '..');
const APP_DIR = path.join(ROOT_DIR, 'app');
const DIST_DIR = path.join(APP_DIR, 'dist', 'pyodide');

// './app/src/utils/PyodideNode/**/*.js'

const entryFiles = (reg, prefix) => glob.sync(reg).reduce((prevVal, curVal, curIdx, array) => {
  prefix = prefix ? prefix : '';
  return typeof prevVal === 'string' ?
    {
      [`${prefix}${path.basename(prevVal, path.extname(prevVal))}`]: prevVal,
      [`${prefix}${path.basename(curVal, path.extname(curVal))}`]: curVal
    }
    :
    { ...prevVal, [`${prefix}${path.basename(curVal, path.extname(curVal))}`]: curVal }
});

export default merge.smart(baseConfig, {
  mode: env,
  devtool: 'cheap-source-map',
  entry: {
    ...entryFiles('./app/src/utils/PyodideNode/*.js'),
    ...entryFiles('./app/src/utils/PyodideNode/packages/*.js', 'packages/')
  },
  output: {
    path: DIST_DIR,
    filename: '[name].js',
  },
  plugins: [
    /**
     * Create global constants which can be configured at compile time
     * Useful for allowing different behaviour between development builds and release builds
     * NODE_ENV should be production so that modules do not perform certain development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: env
    }),
    new CopyWebpackPlugin(
      [
        {
          // Data Assets
          from: '**/*.*',
          to: DIST_DIR,
        }
      ],
      {
        context: './app/src/utils/PyodideNode/',
        ignore: [
          '*.js'
        ]
      }
    ),
    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    }),
    new CleanWebpackPlugin({
      dry: false
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: false,
        cache: true
      })
    ]
  },
  target: 'electron-renderer'
});
