/**
 * Build config for electron renderer process
 */
import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';
import CheckNodeEnv from '../scripts/CheckNodeEnv';
import DeleteSourceMaps from '../scripts/DeleteSourceMaps';

import baseConfig, { CSSLoader } from './webpack.config.base.renderer';

const NODE_ENV = 'production';
CheckNodeEnv(NODE_ENV);
DeleteSourceMaps();

const DevTools = process.env.DEBUG_PROD === 'true' ? { devtool: 'source-map' } : {};

const ROOT_DIR = path.join(__dirname, '../..');
const APP_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(APP_DIR, 'dist');

export default merge(baseConfig, {
  mode: NODE_ENV,
  ...DevTools,
  entry: {
    requirements: ['core-js', 'regenerator-runtime/runtime'],
    renderer: path.join(APP_DIR, 'index.tsx')
  },
  output: {
    filename: '[name].prod.js',
    path: DIST_DIR
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
      DEBUG_PROD: false
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          map: {
            annotation: true,
            inline: false
          }
        }
      })
    ]
  },
  target: 'electron-renderer',
  module: {
    rules: [
      // Styles support - CSS - Extract all .global.css to style.css as is
      {
        test: /\.global\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          CSSLoader
        ]
      },
      // Styles support - CSS - Pipe other styles through css modules and append to style.css
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          merge(CSSLoader, {
            options: {
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]'
              }
            }
          })
        ]
      },
      // Styles support - SASS/SCSS - compile all .global.s[ac]ss files and pipe it to style.css
      {
        test: /\.global\.s[ac]ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          merge(CSSLoader, {
            options: {
              importLoaders: 1
            }
          }),
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      // Styles support - SASS/SCSS - compile all other .s[ac]ss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.s[ac]ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          merge(CSSLoader, {
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]'
              }
            }
          }),
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  }
});
