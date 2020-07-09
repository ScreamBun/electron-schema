/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement - https://webpack.js.org/concepts/hot-module-replacement/
 */
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';

import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

import baseConfig from './webpack.config.base';

const NODE_ENV = 'production';

const ROOT_DIR = path.join(__dirname, '..');
const APP_DIR = path.join(ROOT_DIR, 'app');
const DIST_DIR = path.join(APP_DIR, 'dist');
const DLL_DIR = path.join(ROOT_DIR, 'dll');

const URL_LIMIT = 10 * 1024;
const fontLoader = {
  loader: 'url-loader',
  options: {
    limit: URL_LIMIT,
    fallback: {
      loader: 'file-loader',
      options: {
        name: 'fonts/[name].[ext]',
        publicPath: (url, resourcePath, context) => {
          const isProd = process.env.NODE_ENV === 'production';
          return isProd ? `../${url}` : `resources/assets/${url}`;
        }
      }
    }
  }
};


export default merge.smart(baseConfig, {
  mode: NODE_ENV,
  devtool: 'inline-source-map',
  entry: path.join(APP_DIR, 'index'),
  output: {
    path: DIST_DIR,
    filename: 'renderer.prod.js'
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV,
      DEBUG_PROD: false,
      E2E_BUILD: false
    })
  ],
  target: 'electron-renderer',
  module: {
    rules: [
      {  // Styles support - CSS
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {  // Styles support - LESS - compile all .less files and pipe it to style.css
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                relativeUrls: true,
                strictMath: true
              }
            }
          }
        ]
      },
      {  // Styles support - SASS/SCSS - compile all .sass/.scss files and pipe it to style.css
        test: /\.(scss|sass)$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {  // WOFF Font
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: merge.smart(fontLoader, {
          options: {
            mimetype: 'font/woff'
          }
        })
      },
      {  // WOFF2 Font
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: merge.smart(fontLoader, {
          options: {
            mimetype: 'font/woff2'
          }
        })
      },
      {  // TTF Font
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: merge.smart(fontLoader, {
          options: {
            mimetype: 'font/ttf'
          }
        })
      },
      {  // EOT Font
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: merge.smart(fontLoader, {
          options: {
            mimetype: 'application/vnd.ms-fontobject'
          }
        })
      },
      { // SVG
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: URL_LIMIT,
            mimetype: 'image/svg+xml'
          }
        }
      },
      {  // Common Image Formats
        test: /\.(?:bmp|ico|gif|png|jpe?g|tiff|webp)$/,
        use: 'url-loader'
      }
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  }
});
