/**
 * Build config for electron renderer process
 */
import webpack from 'webpack';
import merge from 'webpack-merge';
import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import TerserPlugin from 'terser-webpack-plugin';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';
import DeleteSourceMaps from '../internals/scripts/DeleteSourceMaps';

import baseConfig from './webpack.config.base';
import Loaders from './webpack.loaders';

const NODE_ENV = 'production';
CheckNodeEnv(NODE_ENV);
DeleteSourceMaps();

const ROOT_DIR = path.join(__dirname, '..');
const APP_DIR = path.join(ROOT_DIR, 'app');
const DIST_DIR = path.join(APP_DIR, 'dist', 'renderer');
const MAX_LIMIT = 10 * 1024;

export default merge.smart(baseConfig, {
  mode: NODE_ENV,
  devtool: 'cheap-source-map',
  entry: path.join(APP_DIR, 'index'),
  output: {
    path: DIST_DIR,
    filename: 'renderer.prod.js'
  },
  plugins: [
    /**
     * Create global constants which can be configured at compile time
     * Useful for allowing different behaviour between development builds and release builds
     * NODE_ENV should be production so that modules do not perform certain development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV
    }),
    new MiniCssExtractPlugin({
      filename: 'css/styles.css'
    }),
    new CopyWebpackPlugin([
      {
        // Theme Assets
        from: path.join(APP_DIR, 'resources', 'assets'),
        to: path.join(DIST_DIR, 'assets'),
        toType: 'dir'
      }
    ]),
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        terserOptions: {
          output: {
            comments: false
          }
        }
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          map: {
            inline: false,
            annotation: true
          }
        }
      })
    ]
  },
  target: 'electron-preload',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {  // LESS support - compile all .less files and pipe it to style.css
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                strictMath: true
              }
            }
          }
        ]
      },
      {  // WOFF Font
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: merge.smart(Loaders.url, {
          options: {
            mimetype: 'application/font-woff'
          }
        })
      },
      {  // WOFF2 Font
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: merge.smart(Loaders.url, {
          options: {
            mimetype: 'application/font-woff'
          }
        })
      },
      {  // TTF Font
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: merge.smart(Loaders.url, {
          options: {
            mimetype: 'application/octet-stream'
          }
        })
      },
      {  // EOT Font
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader'
      },
      { // SVG
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'svg-url-loader',
        options: {
          limit: 10 * 1024,
          noquotes: true,
          fallback: Loaders.file
        }
      },
      {  // Common Image Formats
        test: /\.(?:bmp|ico|gif|png|jpe?g|tiff|webp)$/,
        use: Loaders.url
      }
    ]
  }
});
